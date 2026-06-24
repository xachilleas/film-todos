/**
 * Movie Service
 * Handles API calls for movie-related operations.
 * Provides methods for searching movies and retrieving movie details.
 *
 * @module movieService
 * @requires ./api
 */

import api from './api';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Movie Interface
 * Represents a movie from search results (simplified version)
 */
export interface Movie {
    /** Unique IMDb identifier (e.g., 'tt1375666') */
    imdbID: string;
    /** Movie title */
    Title: string;
    /** Release year */
    Year: string;
    /** URL to movie poster image */
    Poster: string;
    /** Movie type (e.g., 'movie', 'series') - optional */
    Type?: string;
}

/**
 * Movie Detail Interface
 * Extends Movie with additional details for the detail view
 */
export interface MovieDetail extends Movie {
    /** Short plot summary */
    Plot: string;
    /** Director(s) of the movie */
    Director: string;
    /** Actor(s) in the movie */
    Actors: string;
    /** Genre(s) of the movie */
    Genre: string;
    /** Runtime in minutes (e.g., '148 min') */
    Runtime: string;
    /** IMDb rating (e.g., '8.8') */
    imdbRating: string;
}

// ============================================================================
// SERVICE METHODS
// ============================================================================

/**
 * Movie Service
 * Encapsulates all movie-related API calls
 */
export const movieService = {
    /**
     * Search for movies by title
     *
     * @param {string} title - Movie title to search for
     * @returns {Promise<Movie[]>} Array of movies matching the search
     * @throws {Error} If API call fails
     *
     * @example
     * const movies = await movieService.searchMovies('Inception');
     * console.log(movies[0]?.Title); // 'Inception'
     */
    searchMovies: async (title: string): Promise<Movie[]> => {
        const response = await api.get(`/movies/search?title=${title}`);
        return response.data.data;
    },

    /**
     * Get detailed movie information by IMDb ID
     *
     * @param {string} id - IMDb ID of the movie (e.g., 'tt1375666')
     * @returns {Promise<MovieDetail>} Detailed movie information
     * @throws {Error} If movie not found or API call fails
     *
     * @example
     * const movie = await movieService.getMovieDetails('tt1375666');
     * console.log(movie.Director); // 'Christopher Nolan'
     */
    getMovieDetails: async (id: string): Promise<MovieDetail> => {
        const response = await api.get(`/movies/${id}`);
        return response.data.data;
    }
};