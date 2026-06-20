// frontend/src/services/watchlistService.ts

import api from './api';
import type {  WatchlistResponse } from '../types';

export const watchlistService = {
    // Get watchlist with pagination
    getWatchlist: async (page: number = 1, limit: number = 10): Promise<WatchlistResponse> => {
        const response = await api.get('/watchlist', {
            params: { page, limit }
        });
        return response.data;
    },

    // Add to watchlist
    addToWatchlist: async (imdbId: string): Promise<{ message: string }> => {
        const response = await api.post('/watchlist', { imdbId });
        return response.data;
    },

    // Remove from watchlist
    removeFromWatchlist: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete(`/watchlist/${id}`);
        return response.data;
    }
};