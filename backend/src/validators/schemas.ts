/**
 * Zod Validation Schemas
 * Defines validation rules for all API request data.
 * Provides consistent validation across the application with meaningful error messages.
 *
 * @module schemas
 * @requires zod
 */

import { z } from 'zod';

// ============================================================================
// USER SCHEMAS - Authentication & Registration
// ============================================================================

/**
 * Registration validation schema
 * Validates user input when creating a new account
 *
 * @property {string} username - 3-50 chars, alphanumeric + underscore only
 * @property {string} email - Valid email format, max 100 chars
 * @property {string} password - Minimum 6 characters, max 255 chars
 */
export const registerSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username cannot exceed 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string()
        .email('Please provide a valid email address')
        .max(100, 'Email cannot exceed 100 characters'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(255, 'Password cannot exceed 255 characters')
});

/**
 * Login validation schema
 * Validates user credentials for authentication
 *
 * @property {string} email - Valid email format
 * @property {string} password - Password is required (min 1 char)
 */
export const loginSchema = z.object({
    email: z.string()
        .email('Please provide a valid email address'),
    password: z.string()
        .min(1, 'Password is required')
});

// ============================================================================
// MOVIE SCHEMAS - OMDb API Search & Retrieval
// ============================================================================

/**
 * Movie search validation schema
 * Validates search parameters for OMDb API queries
 *
 * @property {string} title - Search title (1-100 chars)
 * @property {string} [page] - Page number (defaults to '1')
 */
export const searchMoviesSchema = z.object({
    title: z.string()
        .min(1, 'Search title is required')
        .max(100, 'Search title cannot exceed 100 characters'),
    page: z.string()
        .optional()
        .transform((val) => {
            if (!val) return '1';
            return val;
        })
        .refine((val) => !isNaN(parseInt(val)), {
            message: 'Page must be a valid number'
        })
});

/**
 * Movie by ID validation schema
 * Validates OMDb movie ID format
 *
 * @property {string} id - IMDb ID format: 'tt' followed by numbers (e.g., 'tt1375666')
 */
export const getMovieByIdSchema = z.object({
    id: z.string()
        .regex(/^tt\d+$/, 'Invalid movie ID format (must start with "tt" followed by numbers)')
});

// ============================================================================
// WATCHLIST SCHEMAS - User Watchlist Operations
// ============================================================================

/**
 * Add to watchlist validation schema
 * Validates movie ID when adding to user's watchlist
 *
 * @property {string} imdbId - IMDb ID format: 'tt' followed by numbers
 */
export const addToWatchlistSchema = z.object({
    imdbId: z.string()
        .regex(/^tt\d+$/, 'Invalid movie ID format (must start with "tt" followed by numbers)')
});

/**
 * Remove from watchlist validation schema
 * Validates movie ID when removing from user's watchlist
 *
 * @property {string} imdbId - IMDb ID format: 'tt' followed by numbers
 */
export const removeFromWatchlistSchema = z.object({
    imdbId: z.string()
        .regex(/^tt\d+$/, 'Invalid movie ID format (must start with "tt" followed by numbers)')
});

/**
 * Watchlist pagination validation schema
 * Validates query parameters for retrieving paginated watchlist
 *
 * @property {string} [page] - Page number (defaults to '1', must be positive)
 * @property {string} [limit] - Items per page (defaults to '10', between 1-100)
 */
export const getWatchlistSchema = z.object({
    page: z.string()
        .optional()
        .transform((val) => {
            if (!val) return '1';
            return val;
        })
        .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
            message: 'Page must be a positive number'
        }),
    limit: z.string()
        .optional()
        .transform((val) => {
            if (!val) return '10';
            return val;
        })
        .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 100, {
            message: 'Limit must be between 1 and 100'
        })
});

// ============================================================================
// INFERRED TYPES - TypeScript Type Definitions
// ============================================================================

/**
 * TypeScript types inferred from Zod schemas
 * These provide type safety in controllers and services
 *
 * @example
 * // In a controller:
 * const validatedData: RegisterInput = req.body;
 * const user = await createUser(validatedData);
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SearchMoviesInput = z.infer<typeof searchMoviesSchema>;
export type GetMovieByIdInput = z.infer<typeof getMovieByIdSchema>;
export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>;
export type RemoveFromWatchlistInput = z.infer<typeof removeFromWatchlistSchema>;
export type GetWatchlistInput = z.infer<typeof getWatchlistSchema>;