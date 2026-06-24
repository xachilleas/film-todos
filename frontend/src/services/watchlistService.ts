/**
 * Watchlist Service
 * Handles API calls for watchlist operations.
 * Provides methods for retrieving, adding, and removing movies from the watchlist.
 *
 * @module watchlistService
 * @requires ./api
 * @requires ../types
 */

import api from './api';
import type { WatchlistResponse } from '../types';

// ============================================================================
// SERVICE METHODS
// ============================================================================

/**
 * Watchlist Service
 * Encapsulates all watchlist-related API calls
 * All methods require authentication (token is automatically added by api interceptor)
 */
export const watchlistService = {
    /**
     * Get the user's watchlist with pagination
     *
     * @param {number} [page=1] - Page number for pagination
     * @param {number} [limit=10] - Number of items per page (max 100)
     * @returns {Promise<WatchlistResponse>} Paginated watchlist data
     * @throws {Error} If API call fails or user is not authenticated
     *
     * @example
     * const { data, pagination } = await watchlistService.getWatchlist(1, 10);
     * console.log(data); // Array of watchlist items
     * console.log(pagination.total); // Total number of items
     */
    getWatchlist: async (page: number = 1, limit: number = 10): Promise<WatchlistResponse> => {
        const response = await api.get('/watchlist', {
            params: { page, limit }
        });
        return response.data;
    },

    /**
     * Add a movie to the user's watchlist
     *
     * @param {string} imdbId - IMDb ID of the movie to add (e.g., 'tt1375666')
     * @returns {Promise<{ message: string }>} Success message
     * @throws {Error} If movie already in watchlist or user is not authenticated
     *
     * @example
     * const result = await watchlistService.addToWatchlist('tt1375666');
     * console.log(result.message); // 'Movie added to watchlist'
     */
    addToWatchlist: async (imdbId: string): Promise<{ message: string }> => {
        const response = await api.post('/watchlist', { imdbId });
        return response.data;
    },

    /**
     * Remove a movie from the user's watchlist
     *
     * @param {string} imdbId - IMDb ID of the movie to remove (e.g., 'tt1375666')
     * @returns {Promise<{ message: string }>} Success message
     * @throws {Error} If movie not in watchlist or user is not authenticated
     *
     * @example
     * const result = await watchlistService.removeFromWatchlist('tt1375666');
     * console.log(result.message); // 'Item successfully removed from watchlist'
     */
    removeFromWatchlist: async (imdbId: string): Promise<{ message: string }> => {
        const response = await api.delete(`/watchlist/${imdbId}`);
        return response.data;
    }
};