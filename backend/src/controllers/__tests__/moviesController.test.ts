// backend/src/controllers/__tests__/moviesController.test.ts

import { MoviesController } from '../MoviesController';
import { OMDbService } from '../../services/OMDbService';
import { Request, Response } from 'express';

// --- MOCK OMDbService ---
jest.mock('../../services/OMDbService');

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

    // Helper function to create mock response
    const createMockResponse = () => {
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        return res;
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create mocked OMDbService
        mockOMDbService = new OMDbService() as jest.Mocked<OMDbService>;

        // Create controller with mocked service
        moviesController = new MoviesController();
        // Replace the service instance with our mock
        (moviesController as any).omdbService = mockOMDbService;

        // Setup mock request and response
        mockReq = {};
        mockRes = createMockResponse();
        mockNext = jest.fn();
    });

    // ============================================
    // TEST: searchMovies - SUCCESS
    // ============================================
    describe('searchMovies', () => {
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
            expect(mockOMDbService.searchMovies).toHaveBeenCalledWith(mockTitle, 1);
            expect(mockOMDbService.searchMovies).toHaveBeenCalledTimes(1);

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

        // ============================================
        // TEST: searchMovies - WITH PAGINATION
        // ============================================
        it('should handle pagination correctly when there are more results', async () => {
            // --- ARRANGE ---
            const mockTitle = 'Batman';
            const mockPage = '2';

            mockReq.query = { title: mockTitle, page: mockPage };

            // 10 results = page 2 has 10 items, so there should be a next page
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

            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockSearchResults.Search,
                pagination: {
                    currentPage: 2,
                    limit: 10,
                    nextPage: 3, // Since there are exactly 10 items and totalResults > 10
                    prevPage: 1
                }
            });
        });

        // ============================================
        // TEST: searchMovies - PAGINATION WITH PREV PAGE
        // ============================================
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

        // ============================================
        // TEST: searchMovies - MISSING TITLE
        // ============================================
        it('should return 400 when title is missing', async () => {
            // --- ARRANGE ---
            mockReq.query = { page: '1' }; // No title

            // --- ACT ---
            await moviesController.searchMovies(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.searchMovies).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Search query parameter "title" is required'
            });
        });

        // ============================================
        // TEST: searchMovies - TITLE NOT A STRING
        // ============================================
        it('should return 400 when title is not a string', async () => {
            // --- ARRANGE ---
            mockReq.query = { title: 123 as any }; // Number instead of string

            // --- ACT ---
            await moviesController.searchMovies(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.searchMovies).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Search query parameter "title" is required'
            });
        });

        // ============================================
        // TEST: searchMovies - EMPTY SEARCH RESULTS
        // ============================================
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

        // ============================================
        // TEST: searchMovies - SERVICE ERROR
        // ============================================
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
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Failed to search movies'
            });
        });
    });

    // ============================================
    // TEST: getMovieById - SUCCESS
    // ============================================
    describe('getMovieById', () => {
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
            expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);
            expect(mockOMDbService.getMovieById).toHaveBeenCalledTimes(1);

            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockMovieDetails
            });
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        // ============================================
        // TEST: getMovieById - MISSING ID
        // ============================================
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

        // ============================================
        // TEST: getMovieById - MOVIE NOT FOUND
        // ============================================
        it('should return 404 when movie is not found', async () => {
            // --- ARRANGE ---
            const mockImdbId = 'tt0000000';
            mockReq.params = { id: mockImdbId };

            // Service returns null/undefined when movie not found
            mockOMDbService.getMovieById.mockResolvedValue(null);

            // --- ACT ---
            await moviesController.getMovieById(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Movie not found'
            });
        });

        // ============================================
        // TEST: getMovieById - SERVICE ERROR
        // ============================================
        it('should return 500 when OMDb service throws error', async () => {
            // --- ARRANGE ---
            const mockImdbId = 'tt1375666';
            mockReq.params = { id: mockImdbId };

            const mockError = new Error('OMDb API error: Movie not found!');
            mockOMDbService.getMovieById.mockRejectedValue(mockError);

            // --- ACT ---
            await moviesController.getMovieById(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Failed to fetch movie details'
            });
        });

        // ============================================
        // TEST: getMovieById - HANDLES UNDEFINED
        // ============================================
        it('should return 404 when service returns undefined', async () => {
            // --- ARRANGE ---
            const mockImdbId = 'tt1375666';
            mockReq.params = { id: mockImdbId };

            // Service returns undefined
            mockOMDbService.getMovieById.mockResolvedValue(undefined);

            // --- ACT ---
            await moviesController.getMovieById(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Movie not found'
            });
        });
    });
});