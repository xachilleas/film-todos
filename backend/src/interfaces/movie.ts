/**
 * Movie Data Types
 * Defines the core movie data structures used throughout the application.
 * These types represent data from the OMDb API and are used in both
 * frontend components and backend services.
 *
 * @module movie
 */

/**
 * Movie Interface
 * Represents a movie's core data as returned by the OMDb API.
 * Used for search results, watchlist items, and movie details.
 *
 * @property {string} imdbID - Unique IMDb identifier (format: 'tt' followed by numbers)
 * @property {string} title - Movie title
 * @property {string} year - Release year (as string from OMDb)
 * @property {string} poster - URL to movie poster image
 * @property {string} plot - Short plot summary
 * @property {string} director - Movie director(s)
 *
 * @example
 * // Example movie data from OMDb
 * const movie: Movie = {
 *   imdbID: 'tt1375666',
 *   title: 'Inception',
 *   year: '2010',
 *   poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjUxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
 *   plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
 *   director: 'Christopher Nolan'
 * };
 */
export interface Movie {
    /** Unique IMDb identifier (e.g., 'tt1375666') */
    imdbID: string;

    /** Movie title */
    title: string;

    /** Release year (as string from OMDb API) */
    year: string;

    /** URL to movie poster image */
    poster: string;

    /** Short plot summary */
    plot: string;

    /** Movie director(s) */
    director: string;
}

/**
 * Optional: Extended Movie interface for detailed view
 * If you need additional fields from OMDb, you can extend this interface
 *
 * @example
 * export interface MovieDetails extends Movie {
 *   runtime: string;
 *   genre: string;
 *   rating: string;
 *   actors: string;
 * }
 */