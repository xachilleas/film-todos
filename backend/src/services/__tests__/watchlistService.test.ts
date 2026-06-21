// backend/src/services/__tests__/watchlistService.test.ts

import { WatchlistService } from '../WatchlistService';
import { WatchlistRepository } from '../../repositories/WatchlistRepository';
import { OMDbService } from '../OMDbService';

// Mock the dependencies
jest.mock('../../repositories/WatchlistRepository');
jest.mock('../OMDbService');

describe('WatchlistService', () => {

    let watchlistService: WatchlistService;
    let mockWatchlistRepository: jest.Mocked<WatchlistRepository>;
    let mockOMDbService: jest.Mocked<OMDbService>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockWatchlistRepository = new WatchlistRepository() as jest.Mocked<WatchlistRepository>;
        mockOMDbService = new OMDbService() as jest.Mocked<OMDbService>;

        watchlistService = new WatchlistService(mockOMDbService, mockWatchlistRepository);
    });

    // --- TEST 1: Get watchlist successfully ---
    it('should return user watchlist items', async () => {
        // --- ARRANGE ---
        const mockUserId = 1;
        const mockPage = 1;
        const mockLimit = 10;
        const mockOffset = 0;

        // Fake data that would come from the repository
        const mockWatchlistItems = [
            {
                id: 1,
                user_id: 1,
                imdb_id: 'tt1234567',
                title: 'Inception',
                year: '2010',
                poster: 'poster.jpg'
            },
            {
                id: 2,
                user_id: 1,
                imdb_id: 'tt7654321',
                title: 'The Dark Knight',
                year: '2008',
                poster: 'poster2.jpg'
            }
        ];

        // Mock the repository method to return the array directly
        mockWatchlistRepository.findByUserId.mockResolvedValue(mockWatchlistItems);

        // --- ACT ---
        const result = await watchlistService.getUserWatchlist(mockUserId, mockPage, mockLimit);

        // --- ASSERT ---
        // Check that result exists and is an array
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);

        // Safe access with non-null assertion since we know result[0] exists
        expect(result[0]?.title).toBe('Inception');
        expect(result[1]?.title).toBe('The Dark Knight');
        expect(result[0]?.user_id).toBe(1);

        // Check that the repository was called correctly
        expect(mockWatchlistRepository.findByUserId).toHaveBeenCalledTimes(1);
        expect(mockWatchlistRepository.findByUserId).toHaveBeenCalledWith(mockUserId, mockLimit, mockOffset);
    });

    // --- TEST 2: Handle empty watchlist ---
    it('should return empty array when user has no watchlist items', async () => {
        // --- ARRANGE ---
        const mockUserId = 999;
        const mockPage = 1;
        const mockLimit = 10;
        const mockOffset = 0;

        // Empty array from repository
        mockWatchlistRepository.findByUserId.mockResolvedValue([]);

        // --- ACT ---
        const result = await watchlistService.getUserWatchlist(mockUserId, mockPage, mockLimit);

        // --- ASSERT ---
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
    });

    // --- TEST 3: Handle repository error ---
    it('should throw error when repository fails', async () => {
        // --- ARRANGE ---
        const mockUserId = 1;
        const mockPage = 1;
        const mockLimit = 10;

        // Simulate a repository error
        const mockError = new Error('Database connection failed');
        mockWatchlistRepository.findByUserId.mockRejectedValue(mockError);

        // --- ACT & ASSERT ---
        await expect(
            watchlistService.getUserWatchlist(mockUserId, mockPage, mockLimit)
        ).rejects.toThrow('Database connection failed');
    });

    // --- TEST 4: Add movie to watchlist successfully ---
    it('should add movie to watchlist and return saved item', async () => {
        // --- ARRANGE ---
        const mockUserId = 1;
        const mockImdbId = 'tt1375666';

        // Fake OMDb response
        const mockMovieData = {
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
            Type: 'movie'
        };

        // Fake saved item from repository
        const mockSavedItem = {
            id: 1,
            user_id: mockUserId,
            imdb_id: mockImdbId,
            title: 'Inception',
            year: '2010',
            poster: 'poster.jpg',
            added_at: new Date()
        };

        // Mock the OMDb service
        mockOMDbService.getMovieById.mockResolvedValue(mockMovieData);

        // Mock the repository save method
        mockWatchlistRepository.save.mockResolvedValue(mockSavedItem);

        // --- ACT ---
        const result = await watchlistService.addToWatchlist(mockUserId, mockImdbId);

        // --- ASSERT ---
        expect(result).toBeDefined();
        expect(result).toEqual(mockSavedItem);
        expect(result?.user_id).toBe(mockUserId);
        expect(result?.imdb_id).toBe(mockImdbId);
        expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);
        expect(mockWatchlistRepository.save).toHaveBeenCalledWith({
            user_id: mockUserId,
            imdb_id: mockImdbId,
            title: 'Inception',
            year: '2010',
            poster: 'poster.jpg'
        });
    });

    // --- TEST 5: Remove movie from watchlist ---
    it('should remove movie from watchlist and return true', async () => {
        // --- ARRANGE ---
        const mockUserId = 1;
        const mockImdbId = 'tt1375666';

        mockWatchlistRepository.delete.mockResolvedValue(true);

        // --- ACT ---
        const result = await watchlistService.removeFromWatchlist(mockUserId, mockImdbId);

        // --- ASSERT ---
        expect(result).toBeDefined();
        expect(result).toBe(true);
        expect(mockWatchlistRepository.delete).toHaveBeenCalledWith(mockUserId, mockImdbId);
    });

    // --- TEST 6: Handle duplicate movie add ---
    it('should throw error when adding movie already in watchlist', async () => {
        // --- ARRANGE ---
        const mockUserId = 1;
        const mockImdbId = 'tt1375666';

        const mockMovieData = {
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

        // Verify the service called OMDb and repository
        expect(mockOMDbService.getMovieById).toHaveBeenCalledWith(mockImdbId);
        expect(mockWatchlistRepository.save).toHaveBeenCalled();
    });
});