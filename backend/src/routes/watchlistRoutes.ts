import { Router } from 'express';
import WatchlistController from "../controllers/WatchlistController";
import { authMiddleware} from "../middleware/auth";
import watchlistController from "../controllers/WatchlistController";

const router = Router();

router.use(authMiddleware);

/**
* @swagger
* /api/watchlist:
    *   post:
    *     summary: Add a movie to watchlist
*     tags: [Watchlist]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
    *             type: object
*             properties:
*               imdbId:
    *                 type: string
*                 example: tt1375666
*     responses:
*       201:
*         description: Movie added successfully
*/
router.post('/', watchlistController.addToWatchlist);

/**
 * @swagger
 * /api/watchlist:
 *   get:
 *     summary: Get user's watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Watchlist retrieved successfully
 */
router.get('/', watchlistController.getUserWatchlist);

/**
 * @swagger
 * /api/watchlist/{imdbId}:
 *   delete:
 *     summary: Remove a movie from watchlist
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imdbId
 *         required: true
 *         schema:
 *           type: string
 *         description: OMDb movie ID
 *     responses:
 *       200:
 *         description: Movie removed successfully
 */
router.delete('/:imdbId', watchlistController.removeFromWatchlist);

export default router;
