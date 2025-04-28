// backend/models/orderModel.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true }, // Store [{ productId, name, price, quantity, size }]
  amount: { type: Number, required: true },
  address: { type: Object, required: true }, // Store { street, city, state, zip, country, phone, firstName, lastName, email }
  status: { type: String, default: "Order Processing" }, // e.g., Order Processing, Shipped, Delivered, Cancelled
  date: { type: Date, default: Date.now() },
  payment: { type: Boolean, default: false }, // Indicate if payment was successful (for future integration)
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
