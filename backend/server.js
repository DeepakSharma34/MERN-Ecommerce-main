// backend/server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import orderRouter from "./routes/orderRoute.js"; // Import order router

const app = express();
const port = process.env.PORT || 4000;

// --- Connect DB and Cloudinary ---
connectDB();
connectCloudinary();

// --- MIDDLEWARE ORDER MATTERS ---

// 1. Configure CORS FIRST to handle preflight (OPTIONS) and actual requests
//    Make sure your frontend origin is correctly specified.
app.use(
  cors({
    // Allow requests from BOTH frontend and admin origins
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173", // User Frontend
      process.env.ADMIN_URL || "http://localhost:5174", // Admin Panel <<< ADDED THIS
    ],
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"], // Allow necessary methods
    allowedHeaders: ["Content-Type", "token"], // IMPORTANT: Allow custom 'token' header
  })
);

// 2. Then use body parser for JSON payloads
app.use(express.json());

// Optional: Simple middleware to log incoming requests (for debugging)
app.use((req, res, next) => {
  console.log(`[Server] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// 3. THEN define your API routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter); // Use order router

// --- Root route and Listener ---
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Optional: Basic error handler middleware (place AFTER routes)
app.use((err, req, res, next) => {
  console.error("[Server Error Handler]", err.stack);
  res
    .status(500)
    .send({ success: false, message: "Something broke on the server!" });
});

app.listen(port, () =>
  console.log(`Server is running on at http://localhost:${port}`)
);
