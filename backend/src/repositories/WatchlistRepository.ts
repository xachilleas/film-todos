/**
 * Watchlist Repository
 * Handles database operations for the WatchlistItems table.
 * Provides CRUD operations for managing user watchlists with pagination support.
 *
 * @module WatchlistRepository
 * @requires ../utils/db
 */

import { getPool } from '../utils/db';

/**
 * WatchlistItem Interface
 * Represents a movie entry in a user's watchlist
 *
 * @property {number} [id] - Unique watchlist item identifier (auto-generated)
 * @property {number} user_id - ID of the user who owns this watchlist item
 * @property {string} imdb_id - Unique IMDb identifier (e.g., 'tt1375666')
 * @property {string} title - Movie title
 * @property {string} year - Release year
 * @property {string} poster - URL to movie poster image
 * @property {Date} [added_at] - Timestamp when movie was added to watchlist (auto-generated)
 */
export interface WatchlistItem {
    id?: number;
    user_id: number;
    imdb_id: string;
    title: string;
    year: string;
    poster: string;
    added_at?: Date;
    Genre?: string;
    Director?: string;
    Actors?: string;
    Runtime?: string;
    imdbRating?: string;
    Plot?: string;
    seen?: boolean;
}

/**
 * Watchlist Repository Class
 * Encapsulates all database operations related to user watchlists
 * Ensures data integrity with existence checks and duplicate prevention
 */
export class WatchlistRepository {

    /**
     * Saves a movie to a user's watchlist
     * Prevents duplicate entries by checking if movie already exists
     *
     * @param {Omit<WatchlistItem, 'id' | 'added_at'>} item - Watchlist item without auto-generated fields
     * @returns {Promise<WatchlistItem>} The created watchlist item with id and added_at populated
     * @throws {Error} If movie is already in the user's watchlist
     *
     * @example
     * const watchlistItem = await watchlistRepository.save({
     *   user_id: 1,
     *   imdb_id: 'tt1375666',
     *   title: 'Inception',
     *   year: '2010',
     *   poster: 'https://m.media-amazon.com/images/...'
     * });
     */
    async save(item: Omit<WatchlistItem, 'id' | 'added_at'>): Promise<WatchlistItem> {
        const pool = getPool();

        // Prevent duplicate watchlist entries
        const exists = await this.exists(item.user_id, item.imdb_id);
        if (exists) {
            throw new Error('Movie already in watchlist');
        }

        // Insert the movie and return the created record
        const result = await pool.request()
            .input('user_id', item.user_id)
            .input('imdb_id', item.imdb_id)
            .input('title', item.title)
            .input('year', item.year)
            .input('poster', item.poster)
            .input('Genre', item.Genre)
            .input('Director', item.Director)
            .input('Actors', item.Actors)
            .input('Runtime', item.Runtime)
            .input('imdbRating', item.imdbRating)
            .input('Plot', item.Plot)
            .input('seen', item.seen)  // ← Add this
            .query(`
                INSERT INTO WatchlistItems (user_id, imdb_id, title, year, poster, Genre, Director, Actors, Runtime, imdbRating, Plot, seen)
                    OUTPUT INSERTED.id, INSERTED.user_id, INSERTED.imdb_id, INSERTED.title, 
               INSERTED.year, INSERTED.poster, INSERTED.added_at,
               INSERTED.Genre, INSERTED.Director, INSERTED.Actors, INSERTED.Runtime, INSERTED.imdbRating, INSERTED.Plot, INSERTED.seen
                VALUES (@user_id, @imdb_id, @title, @year, @poster, @Genre, @Director, @Actors, @Runtime, @imdbRating, @Plot, @seen)
            `);

        return result.recordset[0];
    }

    /**
     * Retrieves all watchlist items for a specific user with pagination
     * Returns items ordered by most recently added first
     *
     * @param {number} userId - ID of the user
     * @param {number} [limit] - Maximum number of items to return (for pagination)
     * @param {number} [offset] - Number of items to skip (for pagination)
     * @returns {Promise<{ items: WatchlistItem[]; total: number }>}
     *          Paginated items and total count for the user
     *
     * @example
     * // Get first 10 items
     * const { items, total } = await watchlistRepository.findByUserId(1, 10, 0);
     *
     * @example
     * // Get next 10 items (page 2)
     * const { items, total } = await watchlistRepository.findByUserId(1, 10, 10);
     */
    async findByUserId(
        userId: number,
        limit?: number,
        offset?: number,
        filter?: 'all' | 'seen' | 'unseen'
    ): Promise<{ items: WatchlistItem[]; total: number }> {
        const pool = getPool();

// Get total count of watchlist items for this user
        let countQuery = 'SELECT COUNT(*) as total FROM WatchlistItems WHERE user_id = @user_id';
        const countRequest = pool.request().input('user_id', userId);

        if (filter && filter !== 'all') {
            const seenValue = filter === 'seen' ? 1 : 0;
            countQuery += ' AND seen = @seen';
            countRequest.input('seen', seenValue);
        }

        const countResult = await countRequest.query(countQuery);
        const total = countResult.recordset[0].total;

// Build the main query to retrieve items
        let query = 'SELECT * FROM WatchlistItems WHERE user_id = @user_id';
        const request = pool.request().input('user_id', userId);

        if (filter && filter !== 'all') {
            const seenValue = filter === 'seen' ? 1 : 0;
            query += ' AND seen = @seen';
            request.input('seen', seenValue);
        }

        query += ' ORDER BY added_at DESC';

// Apply pagination if both limit and offset are provided
        if (limit !== undefined && offset !== undefined) {
            query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
            request.input('offset', offset);
            request.input('limit', limit);
        }

        const result = await request.query(query);

        return {
            items: result.recordset,
            total: total
        };
    }

    /**
     * Removes a movie from a user's watchlist
     *
     * @param {number} userId - ID of the user
     * @param {string} imdbId - IMDb ID of the movie to remove
     * @returns {Promise<boolean>} true if item was successfully removed, false if it didn't exist
     *
     * @example
     * const deleted = await watchlistRepository.delete(1, 'tt1375666');
     * if (deleted) {
     *   // Movie was removed from watchlist
     * }
     */
    async delete(userId: number, imdbId: string): Promise<boolean> {
        const pool = getPool();

        // Execute deletion
        const result = await pool.request()
            .input('user_id', userId)
            .input('imdb_id', imdbId)
            .query('DELETE FROM WatchlistItems WHERE user_id = @user_id AND imdb_id = @imdb_id');

        /**
         * Check if the item still exists after deletion
         * If it no longer exists, deletion was successful
         */
        const stillExists = await this.exists(userId, imdbId);
        return !stillExists;
    }

    /**
     * Checks if a movie exists in a user's watchlist
     * Used for duplicate prevention and existence validation
     *
     * @param {number} userId - ID of the user
     * @param {string} imdbId - IMDb ID of the movie to check
     * @returns {Promise<boolean>} true if movie exists in watchlist, false otherwise
     *
     * @example
     * const exists = await watchlistRepository.exists(1, 'tt1375666');
     * if (exists) {
     *   // Movie is already in watchlist
     * }
     */
    async exists(userId: number, imdbId: string): Promise<boolean> {
        const pool = getPool();

        const result = await pool.request()
            .input('user_id', userId)
            .input('imdb_id', imdbId)
            .query('SELECT COUNT(*) as count FROM WatchlistItems WHERE user_id = @user_id AND imdb_id = @imdb_id');

        return result.recordset[0].count > 0;
    }

    /**
     * Toggles the 'seen' status of a movie in the user's watchlist
     *
     * @param {number} userId - ID of the user
     * @param {string} imdbId - IMDb ID of the movie
     * @returns {Promise<boolean>} The new seen status (true = seen, false = unseen)
     */
    async toggleSeen(userId: number, imdbId: string): Promise<boolean> {
        const pool = getPool();

        // Get current seen status
        const currentResult = await pool.request()
            .input('user_id', userId)
            .input('imdb_id', imdbId)
            .query('SELECT seen FROM WatchlistItems WHERE user_id = @user_id AND imdb_id = @imdb_id');

        if (currentResult.recordset.length === 0) {
            throw new Error('Movie not found in watchlist');
        }

        const currentSeen = currentResult.recordset[0].seen;
        const newSeen = !currentSeen;

        // Update seen status
        await pool.request()
            .input('user_id', userId)
            .input('imdb_id', imdbId)
            .input('seen', newSeen)
            .query('UPDATE WatchlistItems SET seen = @seen WHERE user_id = @user_id AND imdb_id = @imdb_id');

        return newSeen;
    }
}