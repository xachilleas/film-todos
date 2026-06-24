/**
 * Global Error Handler Middleware
 * Catches and processes all errors thrown in the application.
 * Provides consistent error responses to the client.
 *
 * @module errorHandler
 * @requires express
 * @requires ../utils/AppError
 */

import { Request, Response, NextFunction } from 'express';
import AppError from "../utils/AppError";

/**
 * Express global error handler
 * Differentiates between custom AppErrors and generic errors.
 * Logs errors for debugging and returns formatted JSON responses.
 *
 * @param {Error | AppError} err - The error object (could be custom or generic)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function (unused but required for Express)
 *
 * @returns {void} - Sends JSON error response
 *
 * @example
 * // In a controller:
 * throw new AppError('Movie not found', 404);
 *
 * // Error response:
 * { status: 'error', message: 'Movie not found' }
 */
const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Log the full error for debugging purposes
    console.error('Error:', err);

    // Default error response for unknown errors
    let statusCode = 500;
    let message = 'Internal Server Error';

    /**
     * Check if the error is a custom AppError
     * AppError contains specific status codes and user-friendly messages
     */
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Send consistent error response format
    res.status(statusCode).json({
        status: 'error',
        message: message
    });
};

export default errorHandler;