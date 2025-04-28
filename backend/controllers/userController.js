// backend/controllers/userController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel.js";

// --- Authentication Middleware Logic (Integrated) ---
// This function will be used directly in the routes that need protection
export const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  console.log("[authMiddleware] Token from headers:", token);
  if (!token) {
    console.log("[authMiddleware] FAILED: No token provided.");
    return res
      .status(401)
      .json({ success: false, message: "Not authorized. Login Again." });
  }

  try {
    console.log("[authMiddleware] Verifying token...");
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    console.log(
      "[authMiddleware] Token verified. Decoded ID:",
      token_decode.id
    );

    // Attach userId to the request object (not body, to avoid potential conflicts)
    req.userId = token_decode.id;
    console.log("[authMiddleware] userId attached to request:", req.userId);

    next();

    console.log("[authMiddleware] next() called.");
  } catch (error) {
    console.error("[authMiddleware] CATCH block triggered:", error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired. Login Again." });
    }

    console.error(
      "[authMiddleware] Specific JWT verification error:",
      error.message
    );

    return res
      .status(401)
      .json({ success: false, message: "Authorization Error" });
  }
};

// --- Existing User Functions ---
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      const token = createToken(user._id);
      // Return cartData along with token on successful login
      res
        .status(200)
        .json({ success: true, token, cartData: user.cartData || {} });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error while logging in user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      cartData: {}, // Initialize with empty cart
    });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.status(200).json({ success: true, token }); // No need to send cart on register
  } catch (error) {
    console.log("Error while registering user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.status(200).json({ success: true, token });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error while logging in admin: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Cart Controller Logic (Integrated) ---

// Add items to user cart
const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = req.userId; // Get userId from the request object (set by authMiddleware)

    let userData = await userModel.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    if (cartData[itemId][size]) {
      cartData[itemId][size] += 1;
    } else {
      cartData[itemId][size] = 1;
    }

    // Mark 'cartData' as modified since it's a mixed type
    userData.markModified("cartData");
    await userData.save(); // Save the updated user document

    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log("Add to Cart Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error adding item to cart" });
  }
};

// Remove/Update items from user cart
const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.userId; // Get userId from the request object

    let userData = await userModel.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    if (!cartData[itemId] || cartData[itemId][size] === undefined) {
      // Check if size exists
      return res
        .status(400)
        .json({ success: false, message: "Item or size not in cart" });
    }

    if (quantity <= 0) {
      delete cartData[itemId][size];
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      cartData[itemId][size] = quantity;
    }

    // Mark 'cartData' as modified
    userData.markModified("cartData");
    await userData.save(); // Save the updated user document

    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log("Update Cart Error:", error);
    res.status(500).json({ success: false, message: "Error updating cart" });
  }
};

// Fetch user cart data
const getCart = async (req, res) => {
  try {
    const userId = req.userId; // Get userId from the request object
    let userData = await userModel.findById(userId);
    if (!userData) {
      // It's okay if user isn't found in terms of cart, just return empty
      return res.json({ success: true, cartData: {} });
    }
    res.json({ success: true, cartData: userData.cartData || {} });
  } catch (error) {
    console.log("Get Cart Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching cart data" });
  }
};

// Export all functions
export {
  loginUser,
  registerUser,
  loginAdmin,
  // Cart functions
  addToCart,
  updateCart,
  getCart,
};
