/**
 * Watchlist Service Tests
 * Unit tests for WatchlistService using Jest with mocked dependencies.
 * Tests watchlist operations including retrieval, addition, and removal of movies.
 *
 * @module watchlistService.test
 * @requires ../WatchlistService
 * @requires ../../repositories/WatchlistRepository
 * @requires ../OMDbService
 */

import { WatchlistService } from '../WatchlistService';
import { WatchlistRepository, WatchlistItem } from '../../repositories/WatchlistRepository';
import { OMDbService } from '../OMDbService';

// Mock all external dependencies
jest.mock('../../repositories/WatchlistRepository');
jest.mock('../OMDbService');

describe('WatchlistService', () => {
    let watchlistService: WatchlistService;
    let mockWatchlistRepository: jest.Mocked<WatchlistRepository>;
    let mockOMDbService: jest.Mocked<OMDbService>;

    /**
     * Setup before each test
     * Clears all mocks and creates fresh service instance with mocked dependencies
     */
    beforeEach(() => {
        jest.clearAllMocks();

        // Create mocked dependencies
        mockWatchlistRepository = new WatchlistRepository() as jest.Mocked<WatchlistRepository>;
        mockOMDbService = new OMDbService() as jest.Mocked<OMDbService>;

        // Inject mocked dependencies into service
        watchlistService = new WatchlistService(mockOMDbService, mockWatchlistRepository);
    });

    // ============================================================================
    // GET USER WATCHLIST TESTS
    // ============================================================================

    describe('getUserWatchlist', () => {
        /**
         * Test: Successful retrieval of user watchlist
         *
         * Flow:
         * 1. User requests their watchlist
         * 2. Service calls repository with pagination parameters
         * 3. Service returns watchlist items with pagination metadata
         */
        it('should return user watchlist items with pagination', async () => {
            // --- ARRANGE ---
            const mockUserId = 1;
            const mockPage = 1;
            const mockLimit = 10;
            const mockOffset = 0;

            // Mock watchlist items from repository - matching WatchlistItem interface
            const mockWatchlistItems: WatchlistItem[] = [
                {
                    id: 1,
                    user_id: 1,
                    imdb_id: 'tt1234567',
                    title: 'Inception',
                    year: '2010',
                    poster: 'poster.jpg',
                    added_at: new Date()
                },
                {
                    id: 2,
                    user_id: 1,
                    imdb_id: 'tt7654321',
                    title: 'The Dark Knight',
                    year: '2008',
                    poster: 'poster2.jpg',
                    added_at: new Date()
                }
            ];

            // Mock repository to return paginated result
            mockWatchlistRepository.findByUserId.mockResolvedValue({
                items: mockWatchlistItems,
                total: 2
            });

            // --- ACT ---
            const result = await watchlistService.getUserWatchlist(mockUserId, mockPage, mockLimit);

            // --- ASSERT ---
            // Verify result structure
            expect(result).toBeDefined();
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);

            // Verify individual items
            expect(result.data[0]?.title).toBe('Inception');
            expect(result.data[1]?.title).toBe('The Dark Knight');
            expect(result.data[0]?.user_id).toBe(1);

            // Verify pagination metadata
            expect(result.pagination).toBeDefined();
            expect(result.pagination.currentPage).toBe(1);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.total).toBe(2);
            expect(result.pagination.totalPages).toBe(1);
            expect(result.pagination.nextPage).toBe(null);
            expect(result.pagination.prevPage).toBe(null);

            // Verify repository was called correctly
            expect(mockWatchlistRepository.findByUserId).toHaveBeenCalledTimes(1);
            expect(mockWatchlistRepository.findByUserId).toHaveBeenCalledWith(
                mockUserId,
                mockLimit,
                mockOffset
            );
        });

        /**
         * Test: Empty watchlist
         *
         * Flow:
         * 1. User has no movies in watchlist
         * 2. Service returns empty array with pagination metadata
         */
        it('should return empty array when user has no watchlist items', async () => {
            // --- ARRANGE ---
            const mockUserId = 999;
            const mockPage = 1;
            const mockLimit = 10;
            const mockOffset = 0;

            // Empty watchlist from repository
            mockWatchlistRepository.findByUserId.mockResolvedValue({
                items: [],
                total: 0
            });

            // --- ACT ---
            const result = await watchlistService.getUserWatchlist(mockUserId, mockPage, mockLimit);

            // --- ASSERT ---
            expect(result).toBeDefined();
            expect(result.data).toBeDefined();
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
            expect(result.pagination.totalPages).toBe(0);
        });

        /**
         * Test: Repository error handling
         *
         * Flow:
         * 1. User requests watchlist
         * 2. Repository throws database error
         * 3. Service propagates the error
         */
        it('should throw error when repository fails', async () => {
            // --- ARRANGE ---
            const mockUserId = 1;
            const mockPage = 1;
            const mockLimit = 10;

            // Simulate repository error
            const mockError = new Error('Database connection failed');
            mockWatchlistRepository.findByUserId.mockRejectedValue(mockError);

            // --- ACT & ASSERT ---
            await expect(
                watchlistService.getUserWatchlist(mockUserId, mockPage, mockLimit)
            ).rejects.toThrow('Database connection failed');
        });
    });

    // ============================================================================
    // ADD TO WATCHLIST TESTS
    // ============================================================================

    describe('addToWatchlist', () => {
        /**
         * Test: Successful addition of movie to watchlist
         *
         * Flow:
         * 1. User requests to add a movie to watchlist
         * 2. Service fetches movie details from OMDb
         * 3. Service saves movie to repository
         * 4. Service returns saved watchlist item
         */
        it('should add movie to watchlist and return saved item', async () => {
            // --- ARRANGE ---
            const mockUserId = 1;
            const mockImdbId = 'tt1375666';

            // Mock OMDb API response - must match OMDbMovieResponse interface
            const mockMovieData = {
                imdbID: 'tt1375666',
                Title: 'Inception',
                Year: '2010',
                Poster: 'poster.jpg',
                Plot: 'A thief who steals corporate secrets...',
                Director: 'Christopher Nolan',
                Response: 'True',
                Genre: 'Action',
                Actors: 'Leonardo DiCaprio',
                Runtime: '148 min',
                imdbRating: '8.8',
                Type: 'movie'
            };

            // Mock saved watchlist item - matching WatchlistItem interface
            const mockSavedItem: WatchlistItem = {
                id: 1,
                user_id: mockUserId,
                imdb_id: mockImdbId,
                title: 'Inception',
                year: '2010',
                poster: 'poster.jpg',
                added_at: new Date()
            };

            // Mock service calls
            mockOMDbService.getMovieById.mockResolvedValue(mockMovieData);
            mockWatchlistRepository.save.mockResolvedValue(mockSavedItem);

            // --- ACT ---
            const result = await watchlistService.addToWatchlist(mockUserId, mockImdbId);

            // --- ASSERT ---
            // Verify result
            expect(result).toBeDefined();
            expect(result).toEqual(mockSavedItem);
            expect(result?.user_id).toBe(mockUserId);
            expect(result?.imdb_id).toBe(mockImdbId);

            // Verify OMDb service was called
            expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);
            expect(mockOMDbService.getMovieById).toHaveBeenCalledTimes(1);

            // Verify repository save was called with correct data
            expect(mockWatchlistRepository.save).toHaveBeenCalledWith({
                user_id: mockUserId,
                imdb_id: mockImdbId,
                title: 'Inception',
                year: '2010',
                poster: 'poster.jpg'
            });
            expect(mockWatchlistRepository.save).toHaveBeenCalledTimes(1);
        });

        /**
         * Test: Duplicate movie addition
         *
         * Flow:
         * 1. User tries to add a movie already in watchlist
         * 2. OMDb service returns movie data
         * 3. Repository throws duplicate error
         * 4. Service propagates the error
         */
        it('should throw error when adding movie already in watchlist', async () => {
            // --- ARRANGE ---
            const mockUserId = 1;
            const mockImdbId = 'tt1375666';

            // Mock OMDb API response
            const mockMovieData = {
                imdbID: 'tt1375666',
                Title: 'Inception',
                Year: '2010',
                Poster: 'poster.jpg',
                Plot: 'A thief who steals corporate secrets...',
                Director: 'Christopher Nolan',
                Response: 'True',
                Genre: 'Action',
                Actors: 'Leonardo DiCaprio',
                Runtime: '148 min',
                imdbRating: '8.8',
                Type: 'movie'
            };

            // Mock OMDb returns movie
            mockOMDbService.getMovieById.mockResolvedValue(mockMovieData);

            // Mock repository throws "already exists" error
            mockWatchlistRepository.save.mockRejectedValue(new Error('Movie already in watchlist'));

            // --- ACT & ASSERT ---
            await expect(
                watchlistService.addToWatchlist(mockUserId, mockImdbId)
            ).rejects.toThrow('Movie already in watchlist');

            // Verify both service calls were made
            expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);
            expect(mockWatchlistRepository.save).toHaveBeenCalled();
        });
    });

    // ============================================================================
    // REMOVE FROM WATCHLIST TESTS
    // ============================================================================

    describe('removeFromWatchlist', () => {
        /**
         * Test: Successful removal of movie from watchlist
         *
         * Flow:
         * 1. User requests to remove a movie from watchlist
         * 2. Service calls repository delete method
         * 3. Service returns true if deletion was successful
         */
        it('should remove movie from watchlist and return true', async () => {
            // --- ARRANGE ---
            const mockUserId = 1;
            const mockImdbId = 'tt1375666';

            // Mock repository delete returns true
            mockWatchlistRepository.delete.mockResolvedValue(true);

            // --- ACT ---
            const result = await watchlistService.removeFromWatchlist(mockUserId, mockImdbId);

            // --- ASSERT ---
            expect(result).toBeDefined();
            expect(result).toBe(true);

            // Verify repository was called correctly
            expect(mockWatchlistRepository.delete).toHaveBeenCalledWith(mockUserId, mockImdbId);
            expect(mockWatchlistRepository.delete).toHaveBeenCalledTimes(1);
        });

        /**
         * Test: Removal of non-existent movie
         *
         * Flow:
         * 1. User tries to remove a movie not in watchlist
         * 2. Repository returns false
         * 3. Service returns false
         */
        it('should return false when removing non-existent movie', async () => {
            // --- ARRANGE ---
            const mockUserId = 1;
            const mockImdbId = 'tt0000000';

            // Mock repository delete returns false (not found)
            mockWatchlistRepository.delete.mockResolvedValue(false);

            // --- ACT ---
            const result = await watchlistService.removeFromWatchlist(mockUserId, mockImdbId);

            // --- ASSERT ---
            expect(result).toBe(false);
            expect(mockWatchlistRepository.delete).toHaveBeenCalledWith(mockUserId, mockImdbId);
        });

        /**
         * Test: Repository error during deletion
         *
         * Flow:
         * 1. User requests to remove a movie
         * 2. Repository throws database error
         * 3. Service propagates the error
         */
        it('should throw error when repository fails during deletion', async () => {
            // --- ARRANGE ---
            const mockUserId = 1;
            const mockImdbId = 'tt1375666';

            // Simulate repository error
            const mockError = new Error('Database connection failed');
            mockWatchlistRepository.delete.mockRejectedValue(mockError);

            // --- ACT & ASSERT ---
            await expect(
                watchlistService.removeFromWatchlist(mockUserId, mockImdbId)
            ).rejects.toThrow('Database connection failed');
        });
    });
});