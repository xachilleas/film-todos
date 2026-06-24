/**
 * Movie Routes
 * Defines API endpoints for movie search and retrieval operations.
 * Includes Swagger documentation for API testing and reference.
 *
 * @module moviesRoutes
 * @requires express
 * @requires ../controllers/MoviesController
 * @requires ../middleware/validate
 * @requires ../validators/schemas
 */

import express from 'express';
import { MoviesController } from '../controllers/MoviesController';
import { validateQuery, validateParams } from '../middleware/validate';
import { searchMoviesSchema, getMovieByIdSchema } from '../validators/schemas';

// Initialize router and controller
const router = express.Router();
const moviesController = new MoviesController();

// ============================================================================
// SWAGGER DOCUMENTATION - SEARCH MOVIES ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/movies/search:
 *   get:
 *     summary: Search for movies
 *     description: Search the OMDb database for movies by title
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Movie title to search for
 *         example: "Inception"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *     responses:
 *       200:
 *         description: Search results
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
 *                       imdbID:
 *                         type: string
 *                         example: "tt1375666"
 *                       Title:
 *                         type: string
 *                         example: "Inception"
 *                       Year:
 *                         type: string
 *                         example: "2010"
 *                       Poster:
 *                         type: string
 *                         example: "https://m.media-amazon.com/images/M/..."
 *                       Type:
 *                         type: string
 *                         example: "movie"
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
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       500:
 *         description: Server error
 */

/**
 * Search for movies by title
 * GET /api/movies/search?title=Inception&page=1
 * Validates query parameters against searchMoviesSchema before passing to controller
 */
router.get(
    '/search',
    validateQuery(searchMoviesSchema),
    moviesController.searchMovies
);

// ============================================================================
// SWAGGER DOCUMENTATION - GET MOVIE BY ID ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get movie details by ID
 *     description: Get detailed information about a specific movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^tt\\d+$"
 *         description: IMDb ID of the movie
 *         example: "tt1375666"
 *     responses:
 *       200:
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     imdbID:
 *                       type: string
 *                       example: "tt1375666"
 *                     Title:
 *                       type: string
 *                       example: "Inception"
 *                     Year:
 *                       type: string
 *                       example: "2010"
 *                     Poster:
 *                       type: string
 *                       example: "https://m.media-amazon.com/images/M/..."
 *                     Genre:
 *                       type: string
 *                       example: "Action, Adventure, Sci-Fi"
 *                     Director:
 *                       type: string
 *                       example: "Christopher Nolan"
 *                     Actors:
 *                       type: string
 *                       example: "Leonardo DiCaprio, Joseph Gordon-Levitt"
 *                     Runtime:
 *                       type: string
 *                       example: "148 min"
 *                     imdbRating:
 *                       type: string
 *                       example: "8.8"
 *                     Plot:
 *                       type: string
 *                       example: "A thief who steals corporate secrets..."
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Server error
 */

/**
 * Get movie details by IMDb ID
 * GET /api/movies/:id
 * Validates URL parameters against getMovieByIdSchema before passing to controller
 */
router.get(
    '/:id',
    validateParams(getMovieByIdSchema),
    moviesController.getMovieById
);

export default router;