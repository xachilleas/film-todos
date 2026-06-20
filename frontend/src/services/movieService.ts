import api from './api';

export interface Movie {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Type?: string;
}

export interface MovieDetail extends Movie {
    Plot: string;
    Director: string;
    Actors: string;
    Genre: string;
    Runtime: string;
    imdbRating: string;
}

export const movieService = {
    // Search movies by title
    searchMovies: async (title: string): Promise<Movie[]> => {
        const response = await api.get(`/movies/search?title=${title}`);
        return response.data.data;
    },

    // Get movie details by ID
    getMovieDetails: async (id: string): Promise<MovieDetail> => {
        const response = await api.get(`/movies/${id}`);
        return response.data.data;
    }
};