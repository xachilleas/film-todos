import { Request, Response, NextFunction } from 'express';
import { watchlistService } from '../services/WatchlistService';
import AppError from "../utils/AppError";

interface AuthRequest extends Request {
    userId?: number;
}

class WatchlistController {
    async addToWatchlist(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const { imdbId } = req.body;
            if (!userId) {
                throw new AppError('User not authenticated', 401);
            }
            if (!imdbId) {
                throw new AppError('imdbId is required', 400);
            }

            const watchlistItem = await watchlistService.addToWatchlist(userId, imdbId);

            res.status(201).json({
                status: 'success',
                message: 'Movie added to watchlist',
                data: watchlistItem
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserWatchlist(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new AppError('User not authenticated', 401);
            }

            // Get pagination parameters from query string (e.g., ?page=1&limit=2)
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            // Validate page and limit
            if (page < 1) {
                throw new AppError('Page must be 1 or greater', 400);
            }
            if (limit < 1 || limit > 100) {
                throw new AppError('Limit must be between 1 and 100', 400);
            }

            // Call service with pagination parameters
            const watchlist = await watchlistService.getUserWatchlist(userId, page, limit);

            // Calculate next/previous page info
            const hasMore = watchlist.length === limit;
            const nextPage = hasMore ? page + 1 : null;
            const prevPage = page > 1 ? page - 1 : null;

            res.status(200).json({
                status: 'success',
                data: watchlist,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    nextPage: nextPage,
                    prevPage: prevPage
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async removeFromWatchlist(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId;
            const imdbId = req.params.imdbId as string;  // ✅ Type assertion

            if (!userId) {
                throw new AppError('User not authenticated', 401);
            }
            if (!imdbId) {
                throw new AppError('imdbId is required', 400);
            }

            await watchlistService.removeFromWatchlist(userId, imdbId);

            res.status(200).json({
                status: 'success',
                message: 'Item successfully removed from watchlist',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new WatchlistController();