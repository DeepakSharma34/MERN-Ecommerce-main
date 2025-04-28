import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  // Connect using the full URI from the environment variable
  await mongoose.connect(process.env.MONGODB_URI);
};

export default connectDB;
