// backend/routes/orderRoute.js
import express from "express";
import { authMiddleware } from "../controllers/userController.js"; // User auth
import adminAuth from "../middleware/adminAuth.js"; // Import admin auth
import {
  placeOrder,
  listUserOrders,
  listAllOrders,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// User Routes (Protected by user auth)
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.get("/list", authMiddleware, listUserOrders);

// Admin Route (Protected by admin auth)
orderRouter.get("/listall", adminAuth, listAllOrders); // New route for admin

export default orderRouter;
