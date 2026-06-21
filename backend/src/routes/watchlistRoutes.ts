// backend/src/routes/watchlistRoutes.ts

import express from 'express';
import watchlistController from '../controllers/WatchlistController';  // ← No curly braces, no 'new'
import { validateBody, validateQuery, validateParams } from '../middleware/validate';
import {
    addToWatchlistSchema,
    removeFromWatchlistSchema,
    getWatchlistSchema
} from '../validators/schemas';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All watchlist routes require authentication
router.use(authMiddleware);


/**
 * @swagger
 * /api/watchlist:
 *   get:
 *     summary: Get user's watchlist
 *     description: Get all movies in the authenticated user's watchlist with pagination
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Watchlist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       imdb_id:
 *                         type: string
 *                         example: "tt1375666"
 *                       title:
 *                         type: string
 *                         example: "Inception"
 *                       year:
 *                         type: string
 *                         example: "2010"
 *                       poster:
 *                         type: string
 *                         example: "https://m.media-amazon.com/images/M/..."
 *                       added_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     nextPage:
 *                       type: integer
 *                       nullable: true
 *                       example: 2
 *                     prevPage:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: Unauthorized - No token provided
 *       400:
 *         description: Validation error
 */
// GET /api/watchlist - Get user's watchlist
router.get(
    '/',
    validateQuery(getWatchlistSchema),
    watchlistController.getUserWatchlist  // ← Directly use the instance method
);

/**
 * @swagger
 * /api/watchlist:
 *   post:
 *     summary: Add movie to watchlist
 *     description: Add a movie to the authenticated user's watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imdbId
 *             properties:
 *               imdbId:
 *                 type: string
 *                 pattern: "^tt\\d+$"
 *                 description: IMDb ID of the movie to add
 *                 example: "tt1375666"
 *     responses:
 *       201:
 *         description: Movie added to watchlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Movie added to watchlist"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     imdb_id:
 *                       type: string
 *                       example: "tt1375666"
 *                     title:
 *                       type: string
 *                       example: "Inception"
 *                     year:
 *                       type: string
 *                       example: "2010"
 *                     poster:
 *                       type: string
 *                       example: "https://m.media-amazon.com/images/M/..."
 *                     added_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error or movie already in watchlist
 *       401:
 *         description: Unauthorized - No token provided
 */
// POST /api/watchlist - Add movie to watchlist
router.post(
    '/',
    validateBody(addToWatchlistSchema),
    watchlistController.addToWatchlist  // ← Directly use the instance method
);

/**
 * @swagger
 * /api/watchlist/{imdbId}:
 *   delete:
 *     summary: Remove movie from watchlist
 *     description: Remove a movie from the authenticated user's watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imdbId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^tt\\d+$"
 *         description: IMDb ID of the movie to remove
 *         example: "tt1375666"
 *     responses:
 *       200:
 *         description: Movie removed from watchlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Item successfully removed from watchlist"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Movie not found in watchlist
 */

// DELETE /api/watchlist/:imdbId - Remove movie from watchlist
router.delete(
    '/:imdbId',
    validateParams(removeFromWatchlistSchema),
    watchlistController.removeFromWatchlist  // ← Directly use the instance method
);

export default router;