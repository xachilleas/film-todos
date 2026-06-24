/**
 * OMDb Service Tests
 * Unit tests for OMDbService using Jest with mocked Axios.
 * Tests API calls, error handling, and edge cases for movie search and retrieval.
 *
 * @module OMDbService.test
 * @requires ../OMDbService
 * @requires axios
 */

import { OMDbService } from '../OMDbService';
import axios from 'axios';

// Mock Axios dependency
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OMDbService', () => {
    let omdbService: OMDbService;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.OMDB_API_KEY = 'test-api-key';
        omdbService = new OMDbService();
    });

    // ============================================================================
    // SEARCH MOVIES TESTS
    // ============================================================================

    describe('searchMovies', () => {
        it('should return search results for a valid search term', async () => {
            // --- ARRANGE ---
            const searchTerm = 'Inception';
            const mockApiResponse = {
                data: {
                    Search: [
                        {
                            imdbID: 'tt1375666',
                            Title: 'Inception',
                            Year: '2010',
                            Poster: 'poster.jpg',
                            Type: 'movie'
                        }
                    ],
                    totalResults: '1',
                    Response: 'True'
                }
            };

            mockedAxios.get.mockResolvedValue(mockApiResponse);

            // --- ACT ---
            const result = await omdbService.searchMovies(searchTerm);

            // --- ASSERT ---
            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://www.omdbapi.com/',
                {
                    params: {
                        apiKey: 'test-api-key',
                        s: searchTerm,
                        type: 'movie',
                        page: 1
                    }
                }
            );

            // Check that result has the expected structure
            expect(result).toHaveProperty('Search');
            expect(result.Search).toBeDefined();
            expect(result.Search?.length).toBe(1);
            expect(result.Search?.[0]?.Title).toBe('Inception');
            expect(result.totalResults).toBe('1');
        });

        it('should search with page parameter when provided', async () => {
            // --- ARRANGE ---
            const searchTerm = 'Batman';
            const page = 2;
            const mockApiResponse = {
                data: {
                    Search: [
                        {
                            imdbID: 'tt0468569',
                            Title: 'The Dark Knight',
                            Year: '2008',
                            Poster: 'poster.jpg',
                            Type: 'movie'
                        }
                    ],
                    totalResults: '1',
                    Response: 'True'
                }
            };

            mockedAxios.get.mockResolvedValue(mockApiResponse);

            // --- ACT ---
            const result = await omdbService.searchMovies(searchTerm, page);

            // --- ASSERT ---
            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://www.omdbapi.com/',
                {
                    params: {
                        apiKey: 'test-api-key',
                        s: searchTerm,
                        type: 'movie',
                        page: page
                    }
                }
            );

            expect(result).toEqual(mockApiResponse.data);
        });

        it('should return empty array when no movies found', async () => {
            // --- ARRANGE ---
            const searchTerm = 'ThisMovieDoesNotExist12345';
            const mockApiResponse = {
                data: {
                    Response: 'False',
                    Error: 'Movie not found!'
                }
            };

            mockedAxios.get.mockResolvedValue(mockApiResponse);

            // --- ACT ---
            const result = await omdbService.searchMovies(searchTerm);

            // --- ASSERT ---
            expect(result).toEqual({
                Search: [],
                totalResults: '0',
                Response: 'True'
            });
        });

        it('should throw error when OMDb API returns an error', async () => {
            // --- ARRANGE ---
            const searchTerm = 'Inception';
            const mockApiResponse = {
                data: {
                    Response: 'False',
                    Error: 'Too many results'
                }
            };

            mockedAxios.get.mockResolvedValue(mockApiResponse);

            // --- ACT & ASSERT ---
            await expect(
                omdbService.searchMovies(searchTerm)
            ).rejects.toThrow('OMDb API error: Too many results');
        });

        it('should throw error when network request fails', async () => {
            // --- ARRANGE ---
            const searchTerm = 'Inception';
            const networkError = new Error('Network timeout');
            mockedAxios.get.mockRejectedValue(networkError);

            // --- ACT & ASSERT ---
            await expect(
                omdbService.searchMovies(searchTerm)
            ).rejects.toThrow('OMDb API error: Network timeout');
        });

        it('should throw generic error when non-Error object is thrown', async () => {
            // --- ARRANGE ---
            const searchTerm = 'Inception';
            mockedAxios.get.mockRejectedValue('Something went wrong');

            // --- ACT & ASSERT ---
            await expect(
                omdbService.searchMovies(searchTerm)
            ).rejects.toThrow('Unknown error occurred while calling OMDb API');
        });
    });

    // ============================================================================
    // GET MOVIE BY ID TESTS
    // ============================================================================

    describe('getMovieById', () => {
        it('should return movie details for a valid imdbId', async () => {
            // --- ARRANGE ---
            const imdbId = 'tt1375666';
            const mockApiResponse = {
                data: {
                    imdbID: 'tt1375666',
                    Title: 'Inception',
                    Year: '2010',
                    Poster: 'poster.jpg',
                    Genre: 'Action, Adventure, Sci-Fi',
                    Director: 'Christopher Nolan',
                    Actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt',
                    Runtime: '148 min',
                    imdbRating: '8.8',
                    Plot: 'A thief who steals corporate secrets...',
                    Type: 'movie',
                    Response: 'True'
                }
            };

            mockedAxios.get.mockResolvedValue(mockApiResponse);

            // --- ACT ---
            const result = await omdbService.getMovieById(imdbId);

            // --- ASSERT ---
            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://www.omdbapi.com/',
                {
                    params: {
                        apiKey: 'test-api-key',
                        i: imdbId,
                        plot: 'short'
                    }
                }
            );

            // Verify the response contains the expected data
            expect(result).toBeDefined();
            expect(result.imdbID).toBe('tt1375666');
            expect(result.Title).toBe('Inception');
            expect(result.Year).toBe('2010');
            expect(result.Director).toBe('Christopher Nolan');
            expect(result.imdbRating).toBe('8.8');
            expect(result.Response).toBe('True');
        });

        it('should throw error when movie is not found', async () => {
            // --- ARRANGE ---
            const imdbId = 'tt0000000';
            const mockApiResponse = {
                data: {
                    Response: 'False',
                    Error: 'Movie not found!'
                }
            };

            mockedAxios.get.mockResolvedValue(mockApiResponse);

            // --- ACT & ASSERT ---
            await expect(
                omdbService.getMovieById(imdbId)
            ).rejects.toThrow('OMDb API error: Movie not found!');
        });

        it('should throw error when network request fails', async () => {
            // --- ARRANGE ---
            const imdbId = 'tt1375666';
            const networkError = new Error('API rate limit exceeded');
            mockedAxios.get.mockRejectedValue(networkError);

            // --- ACT & ASSERT ---
            await expect(
                omdbService.getMovieById(imdbId)
            ).rejects.toThrow('OMDb API error: API rate limit exceeded');
        });

        it('should throw generic error when non-Error object is thrown', async () => {
            // --- ARRANGE ---
            const imdbId = 'tt1375666';
            mockedAxios.get.mockRejectedValue('Unknown error');

            // --- ACT & ASSERT ---
            await expect(
                omdbService.getMovieById(imdbId)
            ).rejects.toThrow('Unknown error occurred while calling OMDb API');
        });
    });

    // ============================================================================
    // CONSTRUCTOR TESTS
    // ============================================================================

    describe('constructor', () => {
        it('should throw error if OMDB_API_KEY is not defined', () => {
            // --- ARRANGE ---
            delete process.env.OMDB_API_KEY;

            // --- ACT & ASSERT ---
            expect(() => new OMDbService()).toThrow(
                'OMDB_API_KEY is not defined in .env file'
            );
        });
    });
});