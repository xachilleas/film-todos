// ONE generic response type for ALL endpoints
export interface ApiResponse<T> {
    status: "success" | "error";
    message?: string;
    data: T;
    pagination?: {
        currentPage: number;
        limit: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}

// User
export interface User {
    id: number;
    username: string;
    email: string;
}

// Auth specific (data contains token + user)
export interface AuthData {
    token: string;
    user: User;
}
export type AuthResponse = ApiResponse<AuthData>;

// Movie from OMDb
export interface Movie {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Type: string;
}

export interface MovieDetails extends Movie {
    Plot: string;
    Director: string;
    Actors: string;
    Runtime: string;
    Rated: string;
}

export type MoviesSearchResponse = ApiResponse<Movie[]>;
export type MovieDetailsResponse = ApiResponse<MovieDetails>;

// Watchlist
export interface WatchlistItem {
    id: number;
    userId: number;
    imdbID: string;
    title: string;
    year: string;
    poster: string;
    addedAt: string;
    watched: boolean;
}

export type WatchlistGetResponse = ApiResponse<WatchlistItem[]>;
export type WatchlistAddResponse = ApiResponse<WatchlistItem>;
export type WatchlistRemoveResponse = ApiResponse<null>;