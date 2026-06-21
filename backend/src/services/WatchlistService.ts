import { OMDbService } from './OMDbService';
import { WatchlistRepository } from '../repositories/WatchlistRepository'

export class WatchlistService {
    constructor(
        private omdbService : OMDbService,
        private watchlistRepository: WatchlistRepository
    ) {}

    async getUserWatchlist (userId: number, page: number =1, limit: number = 10) {
        const offset = (page -1) * limit;
        const result = await this.watchlistRepository.findByUserId(userId, limit, offset);

        // Calculate pagination
        const total = result.total;
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: result.items,
            pagination: {
                currentPage: page,
                limit: limit,
                total: total,
                totalPages: totalPages,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            }
        };
    }
    async removeFromWatchlist (userId: number, imdbId: string) {
        return await this.watchlistRepository.delete(userId, imdbId);
    }

    async addToWatchlist(userId: number, imdbId: string) {
        //ask OMDb for movie details using the imdbId
        const movieData = await this.omdbService.getMovieById(imdbId);

        //take only the fields we need for our database
        //userId is not coming from the API

        const movieToSave = {
            user_id: userId,
            imdb_id: movieData.imdbID,
            title: movieData.Title,
            year: movieData.Year,
            poster: movieData.Poster
        };

        //telling repository to save it
        return await this.watchlistRepository.save(movieToSave);
        }
    }

const omdbService = new OMDbService();
const watchlistRepository = new WatchlistRepository();
export const watchlistService = new WatchlistService(omdbService, watchlistRepository);

