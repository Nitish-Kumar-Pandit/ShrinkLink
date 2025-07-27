import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        console.log("MongoDB URI:", process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
            socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS) || 45000,
            maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
            minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
            maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME_MS) || 30000,
        });

        // Disable buffering for immediate error feedback
        mongoose.set('bufferCommands', false);

        console.log("✅ Database connected successfully");

        // Set up connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('✅ Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ Mongoose disconnected from MongoDB');
        });

    } catch (error) {
        console.error("❌ Database connection failed:");
        console.error("Error message:", error.message);

        if (error.message.includes("ECONNREFUSED")) {
            console.error("🔧 Solution: Make sure MongoDB is running");
            console.error("   - Start MongoDB service: net start MongoDB");
            console.error("   - Or install MongoDB: https://www.mongodb.com/try/download/community");
        }

        console.error("⚠️  Server will continue without database connection");
        console.error("   Some features may not work properly");

        // Don't exit the process, let the server run without DB
        // process.exit(1);
    }
};

// Database health check
export const checkDBHealth = async () => {
    try {
        const state = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        return {
            status: states[state],
            connected: state === 1,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    } catch (error) {
        return {
            status: 'error',
            connected: false,
            error: error.message
        };
    }
};

export default connectDB;