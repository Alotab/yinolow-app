import mongoose from "mongoose"
import dotenv from "dotenv"
const logger = require("../utils/logger")
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/reactmovie_admin";

if (!MONGO_URI) {
    logger.error('MongoDB connection URI is undefined. Check your .env file.');
    process.exit(1);  // Exit the process if the URI is not found
}


export async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected");
    } catch (err) {
        logger.error("❌ MongoDB connection error:");
        process.exit(1);
    }
}



