/**
 * Custom Application Error Class
 * Extends the native Error class to add HTTP status codes and operational flags.
 * Enables consistent error handling throughout the application.
 *
 * @module AppError
 * @example
 * throw new AppError('User not found', 404);
 * throw new AppError('Invalid credentials', 401);
 * throw new AppError('Database connection failed', 500, false);
 */

/**
 * AppError - Custom error class for application-specific errors
 * Distinguishes between operational errors (expected) and programming errors (unexpected)
 */
class AppError extends Error {
    /**
     * HTTP status code for the error response
     * @example 404 for Not Found, 400 for Bad Request, 500 for Server Error
     */
    public statusCode: number;

    /**
     * Flag indicating if the error is operational (expected)
     * - true: Expected errors (validation, not found, unauthorized)
     * - false: Unexpected errors (bugs, database crashes)
     * Used to determine if the error should be handled gracefully or crash the app
     */
    public isOperational: boolean;

    /**
     * Creates a new AppError instance
     *
     * @param {string} message - User-friendly error message
     * @param {number} statusCode - HTTP status code for the response
     * @param {boolean} [isOperational=true] - Whether the error is expected/operational
     *
     * @example
     * // Operational error (user input validation)
     * throw new AppError('Email is required', 400);
     *
     * @example
     * // Non-operational error (unexpected bug)
     * throw new AppError('Database connection failed', 500, false);
     */
    constructor(message: string, statusCode: number, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        /**
         * Maintain proper prototype chain for instanceof checks
         * Fixes an issue where extending Error in TypeScript loses prototype information
         */
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export default AppError;