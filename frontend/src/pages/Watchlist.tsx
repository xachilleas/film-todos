import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { watchlistService } from '../services/watchlistService';
import type { WatchlistItem } from '../types';
import Toast from "../components/Toast.tsx";

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextPage, setNextPage] = useState<number | null>(null);
    const [prevPage, setPrevPage] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [totalMovies, setTotalMovies] = useState<number>(0);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);



    const { user } = useAuth();

    const fetchWatchlist = async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await watchlistService.getWatchlist(page);

            setWatchlist(response.data);
            setCurrentPage(response.pagination.currentPage);
            setNextPage(response.pagination.nextPage);
            setPrevPage(response.pagination.prevPage);
            setTotalMovies(response.pagination.total);

        } catch (err) {
            setError('Failed to load your watchlist. Please try again.');
            console.error('Error fetching watchlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (imdbId: string) => {
        if (!window.confirm('Remove this movie from your watchlist?')) {
            return;
        }

        try {
            setRemovingId(imdbId);
            await watchlistService.removeFromWatchlist(imdbId);

            setToast({ message: 'Movie removed from watchlist!', type: 'success' });

            // Refresh the current page
            await fetchWatchlist(currentPage);

            // If the current page is now empty and we're not on page 1, go to previous page
            const freshResponse = await watchlistService.getWatchlist(currentPage);
            if (freshResponse.data.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (err) {
            alert('Failed to remove movie. Please try again.');
            console.error('Error removing movie:', err);
        } finally {
            setRemovingId(null);
        }
    };

    useEffect(() => {
        fetchWatchlist(currentPage);
    }, [currentPage]);

    if (loading && watchlist.length === 0) {
        return (
            <div className="loading-container">
                <p>Loading your watchlist...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={() => fetchWatchlist(currentPage)}>Try Again</button>
            </div>
        );
    }

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

    return (
        <div className="watchlist-container">
            <h1>My Watchlist ({totalMovies} movies)</h1>
            {user && <p>Welcome, {user.username || user.email}!</p>}

            <div className="watchlist">
                {watchlist.map((item) => (
                    <div key={item.id} className="watchlist-row">
                        <div className="watchlist-poster">
                            <img
                                src={item.poster !== 'N/A' ? item.poster : '/placeholder.png'}
                                alt={`${item.title} poster`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.png';
                                }}
                            />
                        </div>

                        <div className="watchlist-info">
                            <Link
                                to={`/movie/${item.imdb_id}`}
                                state={{ fromWatchlist: true }}
                                className="movie-title"
                            >
                                {item.title}
                            </Link>
                            <span className="movie-year">{item.year}</span>
                        </div>

                        <button
                            onClick={() => handleRemove(item.imdb_id)}
                            disabled={removingId === item.imdb_id}
                            className="remove-button"
                        >
                            {removingId === item.imdb_id ? 'Removing...' : '✕ Remove'}
                        </button>
                    </div>
                ))}
            </div>

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
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={1500}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Watchlist;