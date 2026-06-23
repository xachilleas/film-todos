import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { watchlistService } from '../services/watchlistService';
import type { WatchlistItem } from '../types';
import Toast from "../components/Toast.tsx";
import { FiTrash2 } from 'react-icons/fi';


const Watchlist = () => {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
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
            const response = await watchlistService.getWatchlist(page);
            setWatchlist(response.data);
            setCurrentPage(response.pagination.currentPage);
            setNextPage(response.pagination.nextPage);
            setPrevPage(response.pagination.prevPage);
            setTotalMovies(response.pagination.total);
        } catch (err) {
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
            await fetchWatchlist(currentPage);
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

    // Loading state
    if (loading && watchlist.length === 0) {
        return (
            <div className="loading-container">
                <p>Loading your watchlist...</p>
            </div>
        );
    }

    // Empty state
    if (watchlist.length === 0 && !loading) {
        return (
            <div className="empty-container">
                <h1>my watchlist</h1>
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
            <h1>my watchlist ({totalMovies} movies)</h1>
            {user && <p>welcome, {user.username || user.email}!</p>}

            <div className="watchlist">
                {watchlist.map((item) => (
                    <div className="watchlist-row" key={item.imdb_id}>
                        {/* Poster Column */}
                        <div className="watchlist-poster">
                            {item.poster && item.poster !== 'N/A' ? (
                                <img
                                    src={item.poster}
                                    alt={`${item.title} poster`}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            const fallback = parent.querySelector('.poster-fallback');
                                            if (fallback) {
                                                (fallback as HTMLElement).style.display = 'flex';
                                            }
                                        }
                                    }}
                                />
                            ) : null}
                            <div
                                className="poster-fallback"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: '#f5f5f5',
                                    display: item.poster && item.poster !== 'N/A' ? 'none' : 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px',
                                }}
                            >
                                <svg
                                    width="30"
                                    height="30"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#ccc"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <rect x="6" y="7" width="3" height="2" />
                                    <rect x="6" y="11" width="3" height="2" />
                                    <rect x="6" y="15" width="3" height="2" />
                                    <rect x="15" y="7" width="3" height="2" />
                                    <rect x="15" y="11" width="3" height="2" />
                                    <rect x="15" y="15" width="3" height="2" />
                                </svg>
                            </div>
                        </div>

                        {/* Info Column */}
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

                        {/* Remove Button - Trash Icon */}
                        <button
                            onClick={() => handleRemove(item.imdb_id)}
                            disabled={removingId === item.imdb_id}
                            className="remove-button"
                            title="Remove from watchlist"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {removingId === item.imdb_id ? (
                                <span style={{ fontSize: '14px', color: '#999' }}>...</span>
                            ) : (
                                <FiTrash2
                                    size={20}
                                    style={{
                                        color: '#999',
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#8B0000'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                                />
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={prevPage === null}
                    className="pagination-button"
                    style={{ fontFamily: 'Kreon, serif' }}
                >
                    ← previous
                </button>
                <span className="page-info">page {currentPage}</span>
                <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={nextPage === null}
                    className="pagination-button"
                    style={{ fontFamily: 'Kreon, serif'}}
                >
                    next →
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