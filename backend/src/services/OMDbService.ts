import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class OMDbService {
    private apiKey: string;
    private baseUrl: string = 'https://www.omdbapi.com/';

    constructor() {
        this.apiKey = process.env.OMDB_API_KEY || '';
        if (!this.apiKey) {
            throw new Error('OMDB_API_KEY is not defined in .env file');
        }
    }


    async getMovieById(imdbId: string) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    apiKey: this.apiKey,
                    i : imdbId,
                    plot: 'short'
                }
            });
            if (response.data.Response === 'False') {
                throw new Error(response.data.Error);
            }

            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`OMDb API error: ${error.message}`);
            }
            throw new Error('Unknown error occurred while calling OMDb API');
        }
    }
    async searchMovies(searchTerm: string, page: number = 1) {
    try {
    const response = await axios.get(this.baseUrl, {
        params: {
            apiKey: this.apiKey,
            s: searchTerm,
            type: 'movie',
            page: page
        }
    });

    if (response.data.Response ==='False') {
    //no results is not an error, just empty result
        if (response.data.Error === 'Movie not found!') {
        return { Search: [], totalResults: '0', Response: 'True'};
        }
    throw new Error(response.data.Error);
    }

    return response.data;
        } catch (error) {
        if (error instanceof Error) {
            throw new Error(`OMDb API error: ' + ${error.message}`);
        }
        throw new Error('Unknown error occurred while calling OMDb API');
    }
    }
    }
