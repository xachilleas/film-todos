/**
 * Authentication Middleware
 * Validates JWT tokens for protected API routes.
 * Extracts and verifies the Bearer token from the Authorization header.
 *
 * @module auth
 * @requires jsonwebtoken
 * @requires express
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extend Express Request interface to include authenticated user ID
 * This allows routes to access the authenticated user's ID via req.userId
 */
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

/**
 * JWT Authentication Middleware
 * Verifies the presence and validity of a Bearer token in the Authorization header.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @returns {void} - Calls next() if authenticated, otherwise sends 401 response
 *
 * @example
 * // Protect a route with authentication
 * app.get('/api/protected', authMiddleware, (req, res) => {
 *     res.json({ userId: req.userId });
 * });
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Validate that the Authorization header exists and uses Bearer scheme
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    // Extract the token from the header (removes 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];

    // Verify that a token was actually extracted
    if (!token) {
        res.status(401).json({ message: 'Access denied. Token missing.' });
        return;
    }

    try {
        // Verify the JWT token using the secret key from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        /**
         * Validate the decoded token structure
         * Ensures it contains a userId property
         */
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            // Attach the userId to the request object for use in subsequent middleware/route handlers
            req.userId = (decoded as any).userId;
            next(); // Proceed to the next middleware or route handler
        } else {
            // Token was valid but missing expected structure
            res.status(401).json({ message: 'Invalid token structure' });
            return;
        }
    } catch (error) {
        // Token is invalid, expired, or malformed
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
};