import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Using 127.0.0.1 instead of localhost to avoid ipv6 resolution issues
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/collabboard");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Don't exit process if DB fails, just log it so server can still handle other things or we can debug
        // process.exit(1); 
    }
};

export default connectDB;
