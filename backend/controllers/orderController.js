// backend/controllers/orderController.js
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
// Import Stripe if you plan to use it for payments later
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Initialize Stripe if needed

// --- Place a new order for a logged-in user ---
const placeOrder = async (req, res) => {
  console.log("[placeOrder Controller] Started.");
  console.log("[placeOrder Controller] Request Body:", req.body);
  // Make sure userId is attached by the middleware
  console.log("[placeOrder Controller] User ID from middleware:", req.userId);

  // Validate if userId exists from middleware
  if (!req.userId) {
    console.error(
      "[placeOrder Controller] ERROR: userId not found on request. Middleware issue?"
    );
    return res
      .status(401)
      .json({
        success: false,
        message: "Authorization Error: User ID missing.",
      });
  }

  try {
    console.log("[placeOrder Controller] Inside TRY block.");

    // Create a new order document based on request data
    const newOrder = new orderModel({
      userId: req.userId, // Use the ID from the authenticated request
      items: req.body.items, // Array of items from the frontend
      amount: req.body.amount, // Total amount from the frontend
      address: req.body.address, // Address object from the frontend
      payment: false, // Default payment to false initially
      // status defaults to "Order Processing" in the model
    });

    console.log("[placeOrder Controller] Attempting to save new order...");
    await newOrder.save(); // Save the order to the database
    console.log(
      "[placeOrder Controller] Order saved successfully. Order ID:",
      newOrder._id
    );

    // Clear the user's cart in the database after successful order placement
    console.log(
      "[placeOrder Controller] Attempting to clear user cart for userId:",
      req.userId
    );
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
    console.log("[placeOrder Controller] User cart cleared successfully.");

    // --- Payment Gateway Integration Placeholder ---
    // If implementing online payment (like Stripe), you would typically:
    // 1. Create line items based on req.body.items
    // 2. Create a Stripe Checkout Session
    // 3. Send the session URL back to the frontend
    // Example:
    // const line_items = req.body.items.map((item) => ({...})); // Format for Stripe
    // const session = await stripe.checkout.sessions.create({
    //    line_items: line_items,
    //    mode: 'payment',
    //    success_url: `${process.env.FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
    //    cancel_url: `${process.env.FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
    // });
    // console.log("[placeOrder Controller] Stripe session created:", session.id);
    // res.json({ success: true, session_url: session.url });
    // --- End Placeholder ---

    // For now (assuming COD or simple completion), send success directly
    console.log(
      "[placeOrder Controller] Sending success response to frontend."
    );
    res.json({ success: true, message: "Order Placed Successfully" }); // Send success response
  } catch (error) {
    console.error("[placeOrder Controller] CATCH block triggered."); // Log entry into catch
    console.error("[placeOrder Controller] Specific error details:", error); // Log the full error object
    // Send a generic server error response
    res
      .status(500)
      .json({
        success: false,
        message: "Error placing order on server. Please try again.",
      });
  }
};

// --- List orders for the logged-in user ---
const listUserOrders = async (req, res) => {
  console.log("[listUserOrders Controller] Started for userId:", req.userId);
  try {
    // Find orders matching the userId from the authenticated request
    const orders = await orderModel.find({ userId: req.userId });
    console.log(
      `[listUserOrders Controller] Found ${orders.length} orders for user.`
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(
      "[listUserOrders Controller] Error fetching user orders:",
      error
    );
    res.status(500).json({ success: false, message: "Error fetching orders." });
  }
};

// --- List ALL orders (Admin only) ---
const listAllOrders = async (req, res) => {
  console.log("[listAllOrders Controller] Admin request started.");
  try {
    // Find all orders, sort by date descending perhaps
    const orders = await orderModel.find({}).sort({ date: -1 });
    console.log(
      `[listAllOrders Controller] Found ${orders.length} total orders.`
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(
      "[listAllOrders Controller] Error fetching all orders:",
      error
    );
    res
      .status(500)
      .json({ success: false, message: "Error fetching all orders." });
  }
};

// --- Update Order Status (Admin only) ---
const updateOrderStatus = async (req, res) => {
  console.log("[updateOrderStatus Controller] Admin request started.");
  try {
    const { orderId, status } = req.body;
    console.log(
      `[updateOrderStatus Controller] Request to update Order ID: ${orderId} to Status: ${status}`
    );

    // Basic validation
    if (!orderId || !status) {
      console.warn(
        "[updateOrderStatus Controller] Validation Failed: Missing orderId or status."
      );
      return res
        .status(400)
        .json({ success: false, message: "Missing order ID or status." });
    }

    // Find and update the order status
    console.log(`[updateOrderStatus Controller] Finding and updating order...`);
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true } // {new: true} returns the updated document
    );

    if (!updatedOrder) {
      console.warn(
        `[updateOrderStatus Controller] Order not found for ID: ${orderId}`
      );
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    console.log(
      `[updateOrderStatus Controller] Order status updated successfully for ID: ${orderId}`
    );
    res.json({ success: true, message: "Order status updated successfully." });
  } catch (error) {
    console.error(
      "[updateOrderStatus Controller] CATCH block triggered:",
      error
    );
    res
      .status(500)
      .json({ success: false, message: "Error updating order status." });
  }
};

// Export all controller functions
export { placeOrder, listUserOrders, listAllOrders, updateOrderStatus };
