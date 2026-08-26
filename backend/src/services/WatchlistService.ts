/**
 * Watchlist Service
 * Handles business logic for user watchlist operations.
 * Orchestrates interactions between OMDb API and Watchlist Repository.
 *
 * @module WatchlistService
 * @requires ./OMDbService
 * @requires ../repositories/WatchlistRepository
 */

import { OMDbService } from './OMDbService';
import { WatchlistRepository } from '../repositories/WatchlistRepository';

/**
 * Watchlist Service Class
 * Contains business logic for managing user watchlists.
 * Acts as a bridge between controllers and data/repository layers.
 *
 * Responsibilities:
 * - Adding movies to watchlist (fetches movie details from OMDb)
 * - Removing movies from watchlist
 * - Retrieving paginated watchlist with metadata
 */
export class WatchlistService {
    /**
     * Creates a new WatchlistService instance
     *
     * @param {OMDbService} omdbService - Service for fetching movie data from OMDb API
     * @param {WatchlistRepository} watchlistRepository - Repository for database operations
     */
    constructor(
        private omdbService: OMDbService,
        private watchlistRepository: WatchlistRepository
    ) {}

    /**
     * Retrieves a paginated watchlist for a specific user
     * Includes pagination metadata for frontend UI
     *
     * @param {number} userId - ID of the user
     * @param {number} [page=1] - Current page number (1-based)
     * @param {number} [limit=10] - Number of items per page
     * @returns {Promise<{
     *   data: WatchlistItem[];
     *   pagination: {
     *     currentPage: number;
     *     limit: number;
     *     total: number;
     *     totalPages: number;
     *     nextPage: number | null;
     *     prevPage: number | null;
     *   }
     * }>} Paginated watchlist items with pagination metadata
     *
     * @example
     * // Get page 2 with 10 items per page
     * const result = await watchlistService.getUserWatchlist(1, 2, 10);
     * console.log(result.data); // Array of watchlist items
     * console.log(result.pagination.totalPages); // 5
     */
    async getUserWatchlist(userId: number, page: number = 1, limit: number = 10) {
        // Calculate offset for database pagination
        const offset = (page - 1) * limit;

        // Fetch data from repository
        const result = await this.watchlistRepository.findByUserId(userId, limit, offset);

        // Calculate pagination metadata
        const total = result.total;
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: result.items,
            pagination: {
                currentPage: page,
                limit: limit,
                total: total,
                totalPages: totalPages,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            }
        };
    }

    /**
     * Removes a movie from a user's watchlist
     *
     * @param {number} userId - ID of the user
     * @param {string} imdbId - IMDb ID of the movie to remove
     * @returns {Promise<boolean>} true if successfully removed, false if not found
     *
     * @example
     * const deleted = await watchlistService.removeFromWatchlist(1, 'tt1375666');
     * if (deleted) {
     *   // Movie removed from watchlist
     * }
     */
    async removeFromWatchlist(userId: number, imdbId: string): Promise<boolean> {
        return await this.watchlistRepository.delete(userId, imdbId);
    }

    /**
     * Adds a movie to a user's watchlist
     * Fetches movie details from OMDb API and saves to database
     *
     * @param {number} userId - ID of the user
     * @param {string} imdbId - IMDb ID of the movie to add
     * @returns {Promise<WatchlistItem>} The newly created watchlist item
     * @throws {Error} If movie not found in OMDb or already in watchlist
     *
     * @example
     * const newItem = await watchlistService.addToWatchlist(1, 'tt1375666');
     * console.log(newItem.title); // 'Inception'
     */
    async addToWatchlist(userId: number, imdbId: string) {
        // Fetch movie details from OMDb API using the provided IMDb ID
        const movieData = await this.omdbService.getMovieById(imdbId);

        /**
         * Transform OMDb API response to match our database schema
         * Only store the fields we need in our WatchlistItems table
         */
        const movieToSave = {
            user_id: userId,
            imdb_id: movieData.imdbID,
            title: movieData.Title,
            year: movieData.Year,
            poster: movieData.Poster,
            Genre: movieData.Genre || 'N/A',
            Director: movieData.Director || 'N/A',
            Actors: movieData.Actors || 'N/A',
            Runtime: movieData.Runtime || 'N/A',
            imdbRating: movieData.imdbRating || 'N/A',
            Plot: movieData.Plot || 'No plot available'
        };

        // Save the movie to the user's watchlist in the database
        return await this.watchlistRepository.save(movieToSave);
    }
}

/**
 * Singleton instance of WatchlistService
 * Pre-configured with OMDbService and WatchlistRepository dependencies
 * Used by controllers for watchlist operations
 */
const omdbService = new OMDbService();
const watchlistRepository = new WatchlistRepository();
export const watchlistService = new WatchlistService(omdbService, watchlistRepository);