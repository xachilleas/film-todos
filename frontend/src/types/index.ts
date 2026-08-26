/**
 * TypeScript Type Definitions
 * Shared types and interfaces used across the frontend application.
 * Includes API responses, user data, movie data, and watchlist types.
 *
 * @module types
 */

// ============================================================================
// GENERIC API TYPES
// ============================================================================

/**
 * Generic API Response Wrapper
 * All API endpoints return this structure with type-specific data
 *
 * @template T - The type of data contained in the response
 */
export interface ApiResponse<T> {
    /** Request status - 'success' or 'error' */
    status: "success" | "error";
    /** Optional message for success or error */
    message?: string;
    /** The actual response data */
    data: T;
    /** Optional pagination metadata (for paginated endpoints) */
    pagination?: {
        /** Current page number */
        currentPage: number;
        /** Number of items per page */
        limit: number;
        /** Next page number or null if on last page */
        nextPage: number | null;
        /** Previous page number or null if on first page */
        prevPage: number | null;
    };
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User Interface
 * Represents an authenticated user in the system
 */
export interface User {
    /** Unique user identifier */
    id: number;
    /** User's display name */
    username: string;
    /** User's email address */
    email: string;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Authentication Data
 * Contains the JWT token and user info returned on login/register
 */
export interface AuthData {
    /** JWT token for API authentication */
    token: string;
    /** Authenticated user information */
    user: User;
}

/**
 * Authentication Response
 * Full response structure for auth endpoints
 */
export type AuthResponse = ApiResponse<AuthData>;

// ============================================================================
// MOVIE TYPES (OMDb API)
// ============================================================================

/**
 * Movie Interface
 * Basic movie data from OMDb search results
 */
export interface Movie {
    /** Unique IMDb identifier (e.g., 'tt1375666') */
    imdbID: string;
    /** Movie title */
    Title: string;
    /** Release year */
    Year: string;
    /** URL to movie poster image */
    Poster: string;
    /** Movie type (e.g., 'movie', 'series') */
    Type: string;
}

/**
 * Movie Details Interface
 * Extended movie data from OMDb single movie lookup
 */
export interface MovieDetails extends Movie {
    /** Short plot summary */
    Plot: string;
    /** Director(s) of the movie */
    Director: string;
    /** Actor(s) in the movie */
    Actors: string;
    /** Runtime in minutes (e.g., '148 min') */
    Runtime: string;
    /** MPAA rating (e.g., 'PG-13') */
    Rated: string;
}

/**
 * Movie Search Response
 * API response for movie search endpoint
 */
export type MoviesSearchResponse = ApiResponse<Movie[]>;

/**
 * Movie Details Response
 * API response for single movie details endpoint
 */
export type MovieDetailsResponse = ApiResponse<MovieDetails>;

// ============================================================================
// WATCHLIST TYPES
// ============================================================================

/**
 * Watchlist Item Interface
 * Represents a movie in a user's watchlist
 */
export interface WatchlistItem {
    /** Unique watchlist entry identifier */
    id: number;
    /** ID of the user who owns this watchlist item */
    user_id: number;
    /** IMDb identifier of the movie */
    imdb_id: string;
    /** Movie title */
    title: string;
    /** Release year */
    year: string;
    /** URL to movie poster image */
    poster: string;
    /** Timestamp when added to watchlist */
    added_at: string;
    /** Whether the movie has been watched */
    watched: boolean;
}

/**
 * Watchlist Paginated Response
 * Full response structure for watchlist GET endpoint
 */
export interface WatchlistResponse {
    /** Array of watchlist items for current page */
    data: WatchlistItem[];
    /** Pagination metadata */
    pagination: {
        /** Current page number */
        currentPage: number;
        /** Number of items per page */
        limit: number;
        /** Total number of items across all pages */
        total: number;
        /** Total number of pages */
        totalPages: number;
        /** Next page number or null if on last page */
        nextPage: number | null;
        /** Previous page number or null if on first page */
        prevPage: number | null;
    };
}

/**
 * Watchlist Get Response
 * API response for getting watchlist
 */
export type WatchlistGetResponse = ApiResponse<WatchlistItem[]>;

/**
 * Watchlist Add Response
 * API response for adding to watchlist
 */
export type WatchlistAddResponse = ApiResponse<WatchlistItem>;

/**
 * Watchlist Remove Response
 * API response for removing from watchlist
 */
export type WatchlistRemoveResponse = ApiResponse<null>;

// ============================================================================
// TOAST TYPES (UI Component)
// ============================================================================

/**
 * Toast Notification Type
 * Used by the Toast component
 */
export type ToastType = 'success' | 'error' | 'info';

/**
 * Toast State
 * Represents a toast notification state
 */
export interface ToastState {
    /** Message to display */
    message: string;
    /** Type of toast (determines color) */
    type: ToastType;
}