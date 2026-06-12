import { getPool } from '../utils/db';

export interface WatchlistItem {
    id?: number;
    user_id: number;
    imdb_id: string;
    title: string;
    year: string;
    poster: string;
    added_at?: Date;
}

export class WatchlistRepository {

    // Save a movie to user's watchlist
    async save(item: Omit<WatchlistItem, 'id' | 'added_at'>): Promise<WatchlistItem> {
        const pool = getPool();

        // Check if movie already exists in user's watchlist
        const exists = await this.exists(item.user_id, item.imdb_id);
        if (exists) {
            throw new Error('Movie already in watchlist');
        }

        // Insert the movie
        const result = await pool.request()
            .input('user_id', item.user_id)
            .input('imdb_id', item.imdb_id)
            .input('title', item.title)
            .input('year', item.year)
            .input('poster', item.poster)
            .query(`
                INSERT INTO WatchlistItems (user_id, imdb_id, title, year, poster)
                    OUTPUT INSERTED.id, INSERTED.user_id, INSERTED.imdb_id, INSERTED.title, 
                       INSERTED.year, INSERTED.poster, INSERTED.added_at
                VALUES (@user_id, @imdb_id, @title, @year, @poster)
            `);

        return result.recordset[0];
    }

    // Get all watchlist items for a user (with pagination)
    async findByUserId(userId: number, limit?: number, offset?: number): Promise<WatchlistItem[]> {
        const pool = getPool();

        let query = 'SELECT * FROM WatchlistItems WHERE user_id = @user_id ORDER BY added_at DESC';
        const request = pool.request().input('user_id', userId);

        // Add pagination if limit and offset are provided
        if (limit !== undefined && offset !== undefined) {
            query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
            request.input('offset', offset);
            request.input('limit', limit);
        }

        const result = await request.query(query);
        return result.recordset;
    }

    // Delete a movie from user's watchlist
    async delete(userId: number, imdbId: string): Promise<boolean> {
        const pool = getPool();
        const result = await pool.request()
            .input('user_id', userId)
            .input('imdb_id', imdbId)
            .query('DELETE FROM WatchlistItems WHERE user_id = @user_id AND imdb_id = @imdb_id');

        // Simple approach: try to find if it still exists after delete
        // If it doesn't exist, deletion was successful
        const stillExists = await this.exists(userId, imdbId);
        return !stillExists;
    }

    // Check if a movie exists in user's watchlist
    async exists(userId: number, imdbId: string): Promise<boolean> {
        const pool = getPool();
        const result = await pool.request()
            .input('user_id', userId)
            .input('imdb_id', imdbId)
            .query('SELECT COUNT(*) as count FROM WatchlistItems WHERE user_id = @user_id AND imdb_id = @imdb_id');

        return result.recordset[0].count > 0;
    }
}