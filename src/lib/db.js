import mongoose from "mongoose";

const connectMongo = async () => {
    const MONGODB_URI = "mongodb://127.0.0.1:27017/nextroute"
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(" MongoDB connected successfully");
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
    throw error;
  }
};

export default connectMongo;