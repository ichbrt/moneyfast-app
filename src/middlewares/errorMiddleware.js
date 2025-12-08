/**
 * Error handling middleware
 */

/**
 * Custom error class
 */
class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not found (404) handler
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default to 500 internal server error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let details = err.details || null;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        details = err.details;
    }

    if (err.code === '23505') {
        // PostgreSQL unique violation
        statusCode = 409;
        message = 'Duplicate entry';
    }

    if (err.code === '23503') {
        // PostgreSQL foreign key violation
        statusCode = 400;
        message = 'Invalid reference';
    }

    // Send response
    res.status(statusCode).json({
        error: message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    AppError,
    notFoundHandler,
    errorHandler,
    asyncHandler,
};
