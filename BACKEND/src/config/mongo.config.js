import mongoose from "mongoose";
import { use } from "react";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected");
    } catch (error) {
        console.log("Database connection failed");
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;