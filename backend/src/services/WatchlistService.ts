import { OMDbService } from './OMDbService';
import { WatchlistRepository } from '../repositories/WatchlistRepository'

export class WatchlistService {
    constructor(
        private omdbService : OMDbService,
        private watchlistRepository: WatchlistRepository
    ) {}

    async getUserWatchlist (userId: number) {
        return await this.watchlistRepository.findByUserId(userId);
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

