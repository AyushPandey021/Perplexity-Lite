import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
   

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected✅");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDatabase;
