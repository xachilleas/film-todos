/**
 * Watchlist Controller
 * Handles HTTP requests for watchlist operations.
 * Manages adding, removing, and retrieving movies from user watchlists.
 *
 * @module WatchlistController
 * @requires express
 * @requires ../services/WatchlistService
 * @requires ../utils/AppError
 */

import { Request, Response, NextFunction } from 'express';
import { watchlistService } from '../services/WatchlistService';
import AppError from "../utils/AppError";

/**
 * Extended Request interface with authenticated user ID
 * Added by authMiddleware to provide user context
 */
interface AuthRequest extends Request {
    userId?: number;
}

/**
 * Watchlist Controller Class
 * Handles HTTP requests for watchlist CRUD operations
 *
 * Responsibilities:
 * - Add movies to user's watchlist
 * - Get paginated watchlist for a user
 * - Remove movies from user's watchlist
 * - Handle authentication and validation
 */
class WatchlistController {
    /**
     * Adds a movie to the authenticated user's watchlist
     *
     * @param {AuthRequest} req - Extended request with userId from auth middleware
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function for error handling
     * @returns {Promise<void>} - Sends JSON response with added watchlist item
     *
     * @example
     * // POST /api/watchlist
     * // Headers: Authorization: Bearer <token>
     * // Request body: { imdbId: "tt1375666" }
     * // Response: { status: "success", message: "Movie added to watchlist", data: {...} }
     */
    async addToWatchlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.userId;
            const { imdbId } = req.body;

            /**
             * Validate authentication
             * userId is set by authMiddleware
             */
            if (!userId) {
                throw new AppError('User not authenticated', 401);
            }

            /**
             * Validate required fields
             * imdbId is required to identify the movie
             */
            if (!imdbId) {
                throw new AppError('imdbId is required', 400);
            }

            try {
                // Attempt to add movie to watchlist
                const watchlistItem = await watchlistService.addToWatchlist(userId, imdbId);

                // Return success with created watchlist item
                res.status(201).json({
                    status: 'success',
                    message: 'Movie added to watchlist',
                    data: watchlistItem
                });
            } catch (error: any) {
                /**
                 * Handle duplicate watchlist entry gracefully
                 * Repository throws specific error for duplicates
                 */
                if (error.message === 'Movie already in watchlist') {
                    res.status(409).json({
                        status: 'error',
                        message: 'Movie already in your watchlist'
                    });
                    return;
                }
                // Re-throw other errors to be handled by global error handler
                throw error;
            }
        } catch (error) {
            // Pass all other errors to global error handler
            next(error);
        }
    }

    /**
     * Retrieves the authenticated user's watchlist with pagination
     *
     * @param {AuthRequest} req - Extended request with userId and query params
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function for error handling
     * @returns {Promise<void>} - Sends JSON response with paginated watchlist
     *
     * @example
     * // GET /api/watchlist?page=2&limit=10
     * // Headers: Authorization: Bearer <token>
     * // Response: { status: "success", data: [...], pagination: {...} }
     */
    async getUserWatchlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.userId;

            // Validate authentication
            if (!userId) {
                throw new AppError('User not authenticated', 401);
            }

            /**
             * Extract and validate pagination parameters
             * Default: page=1, limit=10
             */
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const filter = (req.query.filter as string) as 'all' | 'seen' | 'unseen' || 'all';

            /**
             * Validate pagination bounds
             * - Page must be at least 1
             * - Limit must be between 1 and 100 (prevents performance issues)
             */
            if (page < 1) {
                throw new AppError('Page must be 1 or greater', 400);
            }
            if (limit < 1 || limit > 100) {
                throw new AppError('Limit must be between 1 and 100', 400);
            }

// Fetch watchlist with pagination from service
            const result = await watchlistService.getUserWatchlist(userId, page, limit, filter);

            // Return success with watchlist data and pagination metadata
            res.status(200).json({
                status: 'success',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Removes a movie from the authenticated user's watchlist
     *
     * @param {AuthRequest} req - Extended request with userId and imdbId param
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function for error handling
     * @returns {Promise<void>} - Sends JSON response confirming deletion
     *
     * @example
     * // DELETE /api/watchlist/tt1375666
     * // Headers: Authorization: Bearer <token>
     * // Response: { status: "success", message: "Item successfully removed from watchlist" }
     */
    async removeFromWatchlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.userId;
            const imdbId = req.params.imdbId as string;

            // Validate authentication
            if (!userId) {
                throw new AppError('User not authenticated', 401);
            }

            // Validate imdbId is provided in URL parameters
            if (!imdbId) {
                throw new AppError('imdbId is required', 400);
            }

            // Remove movie from watchlist
            await watchlistService.removeFromWatchlist(userId, imdbId);

            // Return success response (204 No Content could also be used)
            res.status(200).json({
                status: 'success',
                message: 'Item successfully removed from watchlist',
            });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Toggles the 'seen' status of a movie in the user's watchlist
     *
     * @param {AuthRequest} req - Extended request with userId
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async toggleSeen(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.userId;
            const imdbId = req.params.imdbId as string;

            if (!userId) {
                throw new AppError('User not authenticated', 401);
            }

            if (!imdbId) {
                throw new AppError('imdbId is required', 400);
            }

            const newSeenStatus = await watchlistService.toggleSeen(userId, imdbId);

            res.status(200).json({
                status: 'success',
                message: `Movie marked as ${newSeenStatus ? 'seen' : 'unseen'}`,
                data: { seen: newSeenStatus }
            });
        } catch (error) {
            next(error);
        }
    }
}

/**
 * Export a singleton instance of WatchlistController
 * Pre-configured and ready for use in routes
 */
export default new WatchlistController();