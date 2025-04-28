// backend/routes/userRoute.js
import express from "express";
import {
  loginUser,
  registerUser,
  loginAdmin,
  // Import cart functions and auth middleware logic
  authMiddleware,
  addToCart,
  updateCart,
  getCart,
} from "../controllers/userController.js";

const userRouter = express.Router();

// --- Standard User Auth Routes ---
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// --- Admin Login Route ---
userRouter.post("/admin", loginAdmin);

// --- Cart Routes (Protected by authMiddleware) ---
// Apply authMiddleware before cart controller functions
userRouter.post("/cart/add", authMiddleware, addToCart);
userRouter.post("/cart/update", authMiddleware, updateCart);
userRouter.post("/cart/get", authMiddleware, getCart); // Using POST to easily pass token in headers

export default userRouter;
