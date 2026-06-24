/**
 * Movies Controller Tests
 * Unit tests for MoviesController using Jest with mocked dependencies.
 * Tests movie search and retrieval functionality including success and error cases.
 *
 * @module moviesController.test
 * @requires ../MoviesController
 * @requires ../../services/OMDbService
 * @requires express
 */

import { MoviesController } from '../MoviesController';
import { OMDbService } from '../../services/OMDbService';
import { Request, Response } from 'express';

// Mock OMDbService dependency
jest.mock('../../services/OMDbService');

/**
 * Suppress console.error output during tests
 * Prevents error messages from cluttering test output
 * Restores console.error after all tests complete
 */
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    (console.error as jest.Mock).mockRestore();
});

describe('MoviesController', () => {
    let moviesController: MoviesController;
    let mockOMDbService: jest.Mocked<OMDbService>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    /**
     * Creates a mock response object with jest.fn() methods
     * Provides a fresh mock for each test to ensure isolation
     */
    const createMockResponse = (): Partial<Response> => {
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        return res;
    };

    /**
     * Setup before each test
     * Clears all mocks, creates fresh instances, and sets up test environment
     */
    beforeEach(() => {
        // Reset all mock state before each test
        jest.clearAllMocks();

        // Create mocked OMDbService instance
        mockOMDbService = new OMDbService() as jest.Mocked<OMDbService>;

        // Create controller and inject mocked service
        moviesController = new MoviesController();
        (moviesController as any).omdbService = mockOMDbService;

        // Create fresh request and response objects
        mockReq = {};
        mockRes = createMockResponse();
        mockNext = jest.fn();
    });

    // ============================================================================
    // SEARCH MOVIES TESTS
    // ============================================================================

    describe('searchMovies', () => {
        /**
         * Test: Successful movie search
         *
         * Flow:
         * 1. User submits search title
         * 2. System calls OMDb service
         * 3. System returns search results with pagination
         */
        it('should return search results successfully', async () => {
            // --- ARRANGE ---
            const mockTitle = 'Inception';
            const mockPage = '1';

            mockReq.query = { title: mockTitle, page: mockPage };

            const mockSearchResults = {
                Search: [
                    {
                        imdbID: 'tt1375666',
                        Title: 'Inception',
                        Year: '2010',
                        Poster: 'poster.jpg',
                        Type: 'movie'
                    },
                    {
                        imdbID: 'tt1234567',
                        Title: 'Inception: The Beginning',
                        Year: '2012',
                        Poster: 'poster2.jpg',
                        Type: 'movie'
                    }
                ],
                totalResults: '2',
                Response: 'True'
            };

            mockOMDbService.searchMovies.mockResolvedValue(mockSearchResults);

            // --- ACT ---
            await moviesController.searchMovies(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Verify service was called with correct parameters
            expect(mockOMDbService.searchMovies).toHaveBeenCalledWith(mockTitle, 1);
            expect(mockOMDbService.searchMovies).toHaveBeenCalledTimes(1);

            // Verify response
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockSearchResults.Search,
                pagination: {
                    currentPage: 1,
                    limit: 10,
                    nextPage: null,
                    prevPage: null
                }
            });
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        /**
         * Test: Pagination with more results available
         *
         * Flow:
         * 1. User requests page 2
         * 2. System returns 10 results (full page)
         * 3. System calculates nextPage = 3, prevPage = 1
         */
        it('should handle pagination correctly when there are more results', async () => {
            // --- ARRANGE ---
            const mockTitle = 'Batman';
            const mockPage = '2';

            mockReq.query = { title: mockTitle, page: mockPage };

            // Create 10 results (a full page)
            const mockSearchResults = {
                Search: Array(10).fill({
                    imdbID: 'tt0468569',
                    Title: 'The Dark Knight',
                    Year: '2008',
                    Poster: 'poster.jpg',
                    Type: 'movie'
                }),
                totalResults: '25',
                Response: 'True'
            };

            mockOMDbService.searchMovies.mockResolvedValue(mockSearchResults);

            // --- ACT ---
            await moviesController.searchMovies(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.searchMovies).toHaveBeenCalledWith(mockTitle, 2);

            // Verify pagination: 10 results means there's a next page
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockSearchResults.Search,
                pagination: {
                    currentPage: 2,
                    limit: 10,
                    nextPage: 3, // Since we got 10 results, there's likely a next page
                    prevPage: 1
                }
            });
        });

        /**
         * Test: Page 1 should have prevPage = null
         *
         * Flow:
         * 1. User requests page 1
         * 2. System returns results
         * 3. System sets prevPage = null (no previous page)
         */
        it('should set prevPage to null when on page 1', async () => {
            // --- ARRANGE ---
            const mockTitle = 'Inception';
            const mockPage = '1';

            mockReq.query = { title: mockTitle, page: mockPage };

            const mockSearchResults = {
                Search: [
                    { imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Poster: 'poster.jpg', Type: 'movie' }
                ],
                totalResults: '1',
                Response: 'True'
            };

            mockOMDbService.searchMovies.mockResolvedValue(mockSearchResults);

            // --- ACT ---
            await moviesController.searchMovies(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            const callArgs = (mockRes.json as jest.Mock).mock.calls[0]?.[0];
            expect(callArgs?.pagination.prevPage).toBe(null);
            expect(callArgs?.pagination.nextPage).toBe(null);
        });

        /**
         * Test: Missing title parameter
         *
         * Flow:
         * 1. User submits request without title
         * 2. System returns 400 error
         */
        it('should return 400 when title is missing', async () => {
            // --- ARRANGE ---
            mockReq.query = { page: '1' }; // No title

            // --- ACT ---
            await moviesController.searchMovies(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Verify service was NOT called
            expect(mockOMDbService.searchMovies).not.toHaveBeenCalled();

            // Verify error response
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Search query parameter "title" is required'
            });
        });

        /**
         * Test: Title parameter is not a string
         *
         * Flow:
         * 1. User submits title as a number (invalid)
         * 2. System returns 400 error
         */
        it('should return 400 when title is not a string', async () => {
            // --- ARRANGE ---
            mockReq.query = { title: 123 as any };

            // --- ACT ---
            await moviesController.searchMovies(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.searchMovies).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Search query parameter "title" is required'
            });
        });

        /**
         * Test: Empty search results
         *
         * Flow:
         * 1. User searches for a title with no results
         * 2. System returns empty array with success status
         * 3. No error is thrown (empty results is valid)
         */
        it('should return empty array when no movies found', async () => {
            // --- ARRANGE ---
            const mockTitle = 'NoMoviesHere';
            mockReq.query = { title: mockTitle };

            const mockSearchResults = {
                Search: [],
                totalResults: '0',
                Response: 'True'
            };

            mockOMDbService.searchMovies.mockResolvedValue(mockSearchResults);

            // --- ACT ---
            await moviesController.searchMovies(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Verify empty results are returned with success status
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: [],
                pagination: {
                    currentPage: 1,
                    limit: 10,
                    nextPage: null,
                    prevPage: null
                }
            });
        });

        /**
         * Test: Service error handling
         *
         * Flow:
         * 1. User submits valid search
         * 2. OMDb service throws an error
         * 3. System returns 500 error
         */
        it('should return 500 when OMDb service throws error', async () => {
            // --- ARRANGE ---
            const mockTitle = 'Inception';
            mockReq.query = { title: mockTitle };

            const mockError = new Error('OMDb API error: Too many results');
            mockOMDbService.searchMovies.mockRejectedValue(mockError);

            // --- ACT ---
            await moviesController.searchMovies(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.searchMovies).toHaveBeenCalledWith(mockTitle, 1);

            // Verify error response
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Failed to search movies'
            });
        });
    });

    // ============================================================================
    // GET MOVIE BY ID TESTS
    // ============================================================================

    describe('getMovieById', () => {
        /**
         * Test: Successful movie retrieval by ID
         *
         * Flow:
         * 1. User requests movie by IMDb ID
         * 2. System calls OMDb service
         * 3. System returns movie details
         */
        it('should return movie details successfully', async () => {
            // --- ARRANGE ---
            const mockImdbId = 'tt1375666';
            mockReq.params = { id: mockImdbId };

            const mockMovieDetails = {
                imdbID: 'tt1375666',
                Title: 'Inception',
                Year: '2010',
                Poster: 'poster.jpg',
                Genre: 'Action',
                Director: 'Christopher Nolan',
                Actors: 'Leonardo DiCaprio',
                Runtime: '148 min',
                imdbRating: '8.8',
                Plot: 'A thief who steals corporate secrets...',
                Type: 'movie',
                Response: 'True'
            };

            mockOMDbService.getMovieById.mockResolvedValue(mockMovieDetails);

            // --- ACT ---
            await moviesController.getMovieById(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Verify service was called with correct ID
            expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);
            expect(mockOMDbService.getMovieById).toHaveBeenCalledTimes(1);

            // Verify response
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockMovieDetails
            });
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        /**
         * Test: Missing ID parameter
         *
         * Flow:
         * 1. User requests without providing an ID
         * 2. System returns 400 error
         */
        it('should return 400 when id is missing', async () => {
            // --- ARRANGE ---
            mockReq.params = {}; // No id

            // --- ACT ---
            await moviesController.getMovieById(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.getMovieById).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Movie ID is required'
            });
        });

        /**
         * Test: Movie not found (service throws error)
         *
         * Flow:
         * 1. User requests a non-existent movie
         * 2. OMDb service throws "Movie not found" error
         * 3. Controller catches and returns 404
         */
        it('should return 404 when movie is not found', async () => {
            // --- ARRANGE ---
            const mockImdbId = 'tt0000000';
            mockReq.params = { id: mockImdbId };

            // Service throws error when movie not found
            const notFoundError = new Error('OMDb API error: Movie not found!');
            mockOMDbService.getMovieById.mockRejectedValue(notFoundError);

            // --- ACT ---
            await moviesController.getMovieById(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);

            // Verify 404 response
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Movie not found'
            });
        });

        /**
         * Test: Service error handling
         *
         * Flow:
         * 1. User requests a valid movie
         * 2. OMDb service throws an unexpected error
         * 3. System returns 500 error
         */
        it('should return 500 when OMDb service throws unexpected error', async () => {
            // --- ARRANGE ---
            const mockImdbId = 'tt1375666';
            mockReq.params = { id: mockImdbId };

            const mockError = new Error('OMDb API error: Network timeout');
            mockOMDbService.getMovieById.mockRejectedValue(mockError);

            // --- ACT ---
            await moviesController.getMovieById(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);

            // Verify error response
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Failed to fetch movie details'
            });
        });
    });
});