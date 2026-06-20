import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { watchlistService } from '../services/watchlistService';
import type { WatchlistItem } from '../types';

const Watchlist = () => {
    // State
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextPage, setNextPage] = useState<number | null>(null);
    const [prevPage, setPrevPage] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    const { user } = useAuth();

    // Fetch watchlist
    const fetchWatchlist = async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await watchlistService.getWatchlist(page);

            setWatchlist(response.data);
            setCurrentPage(response.pagination.currentPage);
            setNextPage(response.pagination.nextPage);
            setPrevPage(response.pagination.prevPage);
        } catch (err) {
            setError('Failed to load your watchlist. Please try again.');
            console.error('Error fetching watchlist:', err);
        } finally {
            setLoading(false);
        }
    };

    // Remove from watchlist
    const handleRemove = async (id: number) => {
        if (!window.confirm('Remove this movie from your watchlist?')) {
            return;
        }

        try {
            setRemovingId(id);
            await watchlistService.removeFromWatchlist(id);

            // Refresh the list (stay on same page)
            await fetchWatchlist(currentPage);
        } catch (err) {
            alert('Failed to remove movie. Please try again.');
            console.error('Error removing movie:', err);
        } finally {
            setRemovingId(null);
        }
    };

    // Fetch on mount and when page changes
    useEffect(() => {
        fetchWatchlist(currentPage);
    }, [currentPage]);

    // Loading state (first load)
    if (loading && watchlist.length === 0) {
        return (
            <div className="loading-container">
                <p>Loading your watchlist...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={() => fetchWatchlist(currentPage)}>Try Again</button>
            </div>
        );
    }

    // Empty state
    if (watchlist.length === 0) {
        return (
            <div className="empty-container">
                <h1>My Watchlist</h1>
                <p>Your watchlist is empty.</p>
                <Link to="/" className="search-link">
                    Search for movies to add ➜
                </Link>
            </div>
        );
    }

    // Main render
    return (
        <div className="watchlist-container">
            <h1>My Watchlist ({watchlist.length} movies)</h1>
            {user && <p>Welcome, {user.username || user.email}!</p>}

            <div className="watchlist">
                {watchlist.map((item) => (
                    <div key={item.id} className="watchlist-row">
                        {/* Poster Thumbnail */}
                        <div className="watchlist-poster">
                            <img
                                src={item.poster !== 'N/A' ? item.poster : '/placeholder.png'}
                                alt={`${item.title} poster`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.png';
                                }}
                            />
                        </div>

                        {/* Movie Info */}
                        <div className="watchlist-info">
                            <Link to={`/movie/${item.imdb_id}`} className="movie-title">
                                {item.title}
                            </Link>
                            <span className="movie-year">{item.year}</span>
                        </div>

                        {/* Remove Button */}
                        <button
                            onClick={() => handleRemove(item.id)}
                            disabled={removingId === item.id}
                            className="remove-button"
                        >
                            {removingId === item.id ? 'Removing...' : '✕ Remove'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={prevPage === null}
                    className="pagination-button"
                >
                    ← Previous
                </button>

                <span className="page-info">
          Page {currentPage}
        </span>

                <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={nextPage === null}
                    className="pagination-button"
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default Watchlist;