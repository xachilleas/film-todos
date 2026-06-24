/**
 * OMDb API Service
 * Handles communication with the Open Movie Database (OMDb) API.
 * Provides methods for searching movies and retrieving movie details by ID.
 *
 * @module OMDbService
 * @requires axios
 * @requires dotenv
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * OMDb API Response Interfaces
 * Defines the structure of responses from the OMDb API
 */
interface OMDbSearchResponse {
    Search?: Array<{
        imdbID: string;
        Title: string;
        Year: string;
        Poster: string;
        Type: string;
    }>;
    totalResults?: string;
    Response: string;
    Error?: string;
}

/**
 * OMDb Movie Details Response
 * Includes all properties that OMDb returns for a single movie
 */
interface OMDbMovieResponse {
    // Required fields
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Plot: string;
    Director: string;
    Response: string;

    // Optional fields that OMDb returns
    Genre?: string;
    Actors?: string;
    Runtime?: string;
    imdbRating?: string;
    Type?: string;
    Error?: string;
}

/**
 * OMDb Service Class
 * Encapsulates all interactions with the OMDb API
 * Provides error handling and data transformation for movie data
 */
export class OMDbService {
    /** OMDb API key from environment variables */
    private apiKey: string;

    /** Base URL for OMDb API endpoints */
    private baseUrl: string = 'https://www.omdbapi.com/';

    /**
     * Initializes the OMDb service with API key from environment
     * @throws {Error} If OMDB_API_KEY is not defined in .env file
     */
    constructor() {
        this.apiKey = process.env.OMDB_API_KEY || '';
        if (!this.apiKey) {
            throw new Error('OMDB_API_KEY is not defined in .env file');
        }
    }

    /**
     * Retrieves detailed movie information by IMDb ID
     *
     * @param {string} imdbId - IMDb ID (e.g., 'tt1375666')
     * @returns {Promise<OMDbMovieResponse>} Detailed movie data from OMDb
     * @throws {Error} If API call fails or movie is not found
     *
     * @example
     * const movie = await omdbService.getMovieById('tt1375666');
     * console.log(movie.Title); // 'Inception'
     */
    async getMovieById(imdbId: string): Promise<OMDbMovieResponse> {
        try {
            const response = await axios.get<OMDbMovieResponse>(this.baseUrl, {
                params: {
                    apiKey: this.apiKey,
                    i: imdbId,
                    plot: 'short'
                }
            });

            // OMDb returns Response: 'False' for errors (e.g., movie not found)
            if (response.data.Response === 'False') {
                throw new Error(response.data.Error || 'Movie not found');
            }

            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`OMDb API error: ${error.message}`);
            }
            throw new Error('Unknown error occurred while calling OMDb API');
        }
    }

    /**
     * Searches for movies by title with pagination
     *
     * @param {string} searchTerm - Movie title to search for
     * @param {number} [page=1] - Page number for paginated results
     * @returns {Promise<OMDbSearchResponse>} Search results with pagination metadata
     * @throws {Error} If API call fails
     *
     * @example
     * const results = await omdbService.searchMovies('Inception', 1);
     * console.log(results.Search); // Array of movies
     * console.log(results.totalResults); // '47'
     */
    async searchMovies(searchTerm: string, page: number = 1): Promise<OMDbSearchResponse> {
        try {
            const response = await axios.get<OMDbSearchResponse>(this.baseUrl, {
                params: {
                    apiKey: this.apiKey,
                    s: searchTerm,
                    type: 'movie',
                    page: page
                }
            });

            /**
             * Handle 'Movie not found!' as an empty result set
             * This is not an error - it's a valid search with no results
             */
            if (response.data.Response === 'False') {
                if (response.data.Error === 'Movie not found!') {
                    // Return empty results array instead of throwing an error
                    return {
                        Search: [],
                        totalResults: '0',
                        Response: 'True'
                    };
                }
                // Other errors (e.g., invalid API key) should be thrown
                throw new Error(response.data.Error || 'Search failed');
            }

            // Return the full response data
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`OMDb API error: ${error.message}`);
            }
            throw new Error('Unknown error occurred while calling OMDb API');
        }
    }
}