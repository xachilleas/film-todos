// backend/src/validators/schemas.ts

import { z } from 'zod';

// --- USER SCHEMAS ---
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

export const loginSchema = z.object({
    email: z.string()
        .email('Please provide a valid email address'),
    password: z.string()
        .min(1, 'Password is required')
});

// --- MOVIE SCHEMAS ---
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

export const getMovieByIdSchema = z.object({
    id: z.string()
        .regex(/^tt\d+$/, 'Invalid movie ID format (must start with "tt" followed by numbers)')
});

// --- WATCHLIST SCHEMAS ---
export const addToWatchlistSchema = z.object({
    imdbId: z.string()
        .regex(/^tt\d+$/, 'Invalid movie ID format (must start with "tt" followed by numbers)')
});

export const removeFromWatchlistSchema = z.object({
    imdbId: z.string()
        .regex(/^tt\d+$/, 'Invalid movie ID format (must start with "tt" followed by numbers)')
});

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

// --- INFERRED TYPES (optional - for TypeScript) ---
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SearchMoviesInput = z.infer<typeof searchMoviesSchema>;
export type GetMovieByIdInput = z.infer<typeof getMovieByIdSchema>;
export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>;
export type RemoveFromWatchlistInput = z.infer<typeof removeFromWatchlistSchema>;
export type GetWatchlistInput = z.infer<typeof getWatchlistSchema>;