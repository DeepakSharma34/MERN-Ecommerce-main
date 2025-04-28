// backend/controllers/orderController.js
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// --- Existing placeOrder, listUserOrders, listAllOrders ---
const placeOrder = async (req, res) => {
  /* ... */
};
const listUserOrders = async (req, res) => {
  /* ... */
};
const listAllOrders = async (req, res) => {
  /* ... */
};

// --- NEW FUNCTION: Update Order Status (Admin) ---
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Basic validation
    if (!orderId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Missing order ID or status." });
    }

    // Find and update the order status
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    ); // {new: true} returns the updated document

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    res.json({ success: true, message: "Order status updated successfully." });
  } catch (error) {
    console.log("Update Order Status Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating order status." });
  }
};

// Export the new function along with existing ones
export { placeOrder, listUserOrders, listAllOrders, updateOrderStatus };
