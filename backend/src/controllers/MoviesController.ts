/**
 * Movies Controller
 * Handles HTTP requests for movie-related operations using the OMDb API.
 * Provides movie search and detailed movie information endpoints.
 *
 * @module MoviesController
 * @requires ../services/OMDbService
 */

import { Request, Response } from 'express';
import { OMDbService } from "../services/OMDbService";

/**
 * Movies Controller Class
 * Handles HTTP requests for movie search and retrieval
 *
 * Responsibilities:
 * - Search for movies by title with pagination
 * - Get detailed movie information by IMDb ID
 * - Format API responses for frontend consumption
 */
export class MoviesController {
    /** Service for OMDb API communication */
    private omdbService: OMDbService;

    /**
     * Initializes the MoviesController with OMDbService
     */
    constructor() {
        this.omdbService = new OMDbService();
    }

    /**
     * Searches for movies by title
     *
     * @param {Request} req - Express request object with 'title' query parameter
     * @param {Response} res - Express response object
     * @returns {Promise<void>} - Sends JSON response with search results and pagination
     *
     * @example
     * // GET /api/movies/search?title=Inception&page=2
     * // Response: { status: "success", data: [...], pagination: { currentPage: 2, ... } }
     */
    searchMovies = async (req: Request, res: Response): Promise<void> => {
        // Extract search parameters from query string
        const { title, page = '1' } = req.query;

        /**
         * Validate that search title is provided
         * Title is required for OMDb API search
         */
        if (!title || typeof title !== 'string') {
            res.status(400).json({
                message: 'Search query parameter "title" is required'
            });
            return;
        }

        try {
            // Parse page number from string to integer (defaults to 1)
            const pageNum = parseInt(page as string);

            // Search movies using OMDb service
            const results = await this.omdbService.searchMovies(title, pageNum);

            /**
             * Calculate pagination metadata
             * OMDb returns up to 10 results per page
             * If we got 10 results, assume there's a next page
             */
            const hasNextPage = results.Search && results.Search.length === 10;
            const hasPrevPage = pageNum > 1;

            // Send success response with search results and pagination info
            res.json({
                status: "success",
                data: results.Search || [],
                pagination: {
                    currentPage: pageNum,
                    limit: 10,
                    nextPage: hasNextPage ? pageNum + 1 : null,
                    prevPage: hasPrevPage ? pageNum - 1 : null
                }
            });

        } catch (error) {
            // Log error for debugging
            console.error('OMDb search error:', error);

            // Send generic error response to client
            res.status(500).json({
                message: 'Failed to search movies'
            });
        }
    }

    /**
     * Retrieves detailed movie information by IMDb ID
     *
     * @param {Request} req - Express request object with 'id' URL parameter
     * @param {Response} res - Express response object
     * @returns {Promise<void>} - Sends JSON response with movie details
     *
     * @example
     * // GET /api/movies/tt1375666
     * // Response: { status: "success", data: { imdbID: "tt1375666", Title: "Inception", ... } }
     */
    getMovieById = async (req: Request, res: Response): Promise<void> => {
        // Extract IMDb ID from URL parameters
        const { id } = req.params;

        /**
         * Validate that movie ID is provided
         * ID is required for OMDb API lookup
         */
        if (!id) {
            res.status(400).json({
                message: 'Movie ID is required'
            });
            return;
        }

        try {
            // Fetch movie details from OMDb service
            const movie = await this.omdbService.getMovieById(id as string);

            /**
             * Check if movie was found
             * OMDb returns Response: 'False' for not found,
             * which our service converts to an error
             */
            if (!movie) {
                res.status(404).json({
                    message: 'Movie not found'
                });
                return;
            }

            // Send success response with movie details
            res.json({
                status: "success",
                data: movie
            });

        } catch (error) {
            // Log error for debugging
            console.error('OMDb fetch error:', error);

            // Send generic error response to client
            res.status(500).json({
                message: 'Failed to fetch movie details'
            });
        }
    }
}