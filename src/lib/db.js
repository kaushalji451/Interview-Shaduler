import mongoose from "mongoose";

const connectMongo = async () => {
    const MONGODB_URI = process.env.MONGODB_URI
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(" MongoDB connected successfully");
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
    throw error;
  }
};

export default connectMongo;