import mongoose from 'mongoose';

/**
 * Middleware to check if database is connected
 * Returns 503 Service Unavailable if database is not connected
 */
export const checkDatabaseConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "Database service unavailable",
            error: "MongoDB is not connected. Please ensure MongoDB is running."
        });
    }
    next();
};

/**
 * Middleware to handle database errors gracefully
 */
export const handleDatabaseError = (error, req, res, next) => {
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
        return res.status(503).json({
            success: false,
            message: "Database operation failed",
            error: "Please try again later or contact support if the problem persists."
        });
    }
    next(error);
};
