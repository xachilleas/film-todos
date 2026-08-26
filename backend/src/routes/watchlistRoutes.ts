/**
 * Watchlist Routes
 * Defines API endpoints for watchlist operations.
 * All routes require JWT authentication.
 * Includes Swagger documentation for API testing and reference.
 *
 * @module watchlistRoutes
 * @requires express
 * @requires ../controllers/WatchlistController
 * @requires ../middleware/validate
 * @requires ../validators/schemas
 * @requires ../middleware/auth
 */

import express from 'express';
import watchlistController from '../controllers/WatchlistController';
import { validateBody, validateQuery, validateParams } from '../middleware/validate';
import {
    addToWatchlistSchema,
    removeFromWatchlistSchema,
    getWatchlistSchema
} from '../validators/schemas';
import { authMiddleware } from '../middleware/auth';

// Initialize router
const router = express.Router();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Apply authentication middleware to all watchlist routes
 * All watchlist operations require a valid JWT token
 * This ensures only authenticated users can access their watchlist
 */
router.use(authMiddleware);

// ============================================================================
// SWAGGER DOCUMENTATION - GET WATCHLIST ENDPOINT
// ============================================================================

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

/**
 * Get authenticated user's watchlist with pagination
 * GET /api/watchlist?page=1&limit=10
 * Validates query parameters against getWatchlistSchema before passing to controller
 */
router.get(
    '/',
    validateQuery(getWatchlistSchema),
    watchlistController.getUserWatchlist
);

// ============================================================================
// SWAGGER DOCUMENTATION - ADD TO WATCHLIST ENDPOINT
// ============================================================================

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

/**
 * Add a movie to authenticated user's watchlist
 * POST /api/watchlist
 * Request body: { imdbId: "tt1375666" }
 * Validates body against addToWatchlistSchema before passing to controller
 */
router.post(
    '/',
    validateBody(addToWatchlistSchema),
    watchlistController.addToWatchlist
);

// ============================================================================
// SWAGGER DOCUMENTATION - REMOVE FROM WATCHLIST ENDPOINT
// ============================================================================

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

/**
 * Remove a movie from authenticated user's watchlist
 * DELETE /api/watchlist/:imdbId
 * Validates URL parameters against removeFromWatchlistSchema before passing to controller
 */
router.delete(
    '/:imdbId',
    validateParams(removeFromWatchlistSchema),
    watchlistController.removeFromWatchlist
);

router.patch('/:imdbId/seen', authMiddleware, watchlistController.toggleSeen.bind(watchlistController));

export default router;