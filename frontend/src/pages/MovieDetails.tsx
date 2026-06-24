/**
 * Movie Details Page Component
 * Displays detailed information about a specific movie.
 * Allows users to add/remove movies from watchlist.
 *
 * @module MovieDetails
 * @requires react
 * @requires react-router-dom
 * @requires ../services/movieService
 * @requires ../services/watchlistService
 * @requires ../contexts/AuthContext
 * @requires react-icons/md
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { MovieDetail } from '../services/movieService';
import { watchlistService } from '../services/watchlistService';
import { useAuth } from '../contexts/AuthContext';
import { MdNoPhotography } from 'react-icons/md';

/**
 * Movie Details Page Component
 *
 * Features:
 * - Fetches and displays movie details by IMDb ID
 * - Add movie to watchlist with authentication check
 * - Remove movie from watchlist with confirmation
 * - Back navigation to search results or watchlist
 * - Poster fallback with Material Design icon
 * - Loading and error states
 *
 * @returns {JSX.Element} Rendered movie details page
 */
const MovieDetails = () => {
    // Route parameters
    const { id } = useParams<{ id: string }>();

    // Hooks
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [imageFailed, setImageFailed] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isRemoving, setIsRemoving] = useState<boolean>(false);
    const [addedToWatchlist, setAddedToWatchlist] = useState<boolean>(false);

    // Check if user came from watchlist (for back navigation)
    const fromWatchlist = location.state?.fromWatchlist || false;

    /**
     * Fetch movie details on component mount or ID change
     */
    useEffect(() => {
        const fetchMovieDetails = async (): Promise<void> => {
            if (!id) return;

            setLoading(true);
            setError('');
            setImageFailed(false);

            try {
                const data = await movieService.getMovieDetails(id);
                setMovie(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load movie details');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    /**
     * Add movie to user's watchlist
     * Redirects to login if user is not authenticated
     */
    const handleAddToWatchlist = async (): Promise<void> => {
        if (!user) {
            navigate('/login', { state: { from: `/movie/${id}` } });
            return;
        }

        setIsAdding(true);
        try {
            await watchlistService.addToWatchlist(id!);
            setAddedToWatchlist(true);
            alert('Movie added to watchlist!');
        } catch (error: any) {
            if (error.response?.status === 409) {
                alert('Movie already in your watchlist!');
            } else {
                alert('Failed to add to watchlist. Please try again.');
            }
        } finally {
            setIsAdding(false);
        }
    };

    /**
     * Remove movie from user's watchlist
     * Shows confirmation dialog before removal
     */
    const handleRemoveFromWatchlist = async (): Promise<void> => {
        if (!user) {
            navigate('/login', { state: { from: `/movie/${id}` } });
            return;
        }

        if (!window.confirm('Remove this movie from your watchlist?')) {
            return;
        }

        setIsRemoving(true);
        try {
            await watchlistService.removeFromWatchlist(id!);
            setAddedToWatchlist(false);
            alert('Movie removed from watchlist!');
            // Navigate back to watchlist after removal
            navigate('/watchlist');
        } catch (error: any) {
            alert('Failed to remove from watchlist. Please try again.');
        } finally {
            setIsRemoving(false);
        }
    };

    // Loading state
    if (loading) {
        return <div style={{ padding: '20px' }}>Loading movie details...</div>;
    }

    // Error state
    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    // Not found state
    if (!movie) {
        return <div style={{ padding: '20px' }}>Movie not found</div>;
    }

    // Determine if poster placeholder should be shown
    const showPlaceholder = !movie.Poster ||
        movie.Poster === 'N/A' ||
        movie.Poster === '' ||
        imageFailed;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Back Navigation - Positioned above poster, aligned left */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                {fromWatchlist ? (
                    <Link
                        to="/watchlist"
                        style={{ textDecoration: 'none', color: '#008080', fontWeight: 'bold' }}
                    >
                        ← back to watchlist
                    </Link>
                ) : (
                    <Link
                        to={location.state?.fromSearch ? `/?search=${encodeURIComponent(location.state.fromSearch)}` : '/'}
                        style={{ textDecoration: 'none', color: '#008080', fontWeight: 'bold' }}
                    >
                        ← back to search results
                    </Link>
                )}
            </div>

            {/* Movie Details Layout */}
            <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
                {/* Poster Column */}
                <div style={{ flex: '0 0 300px' }}>
                    <div style={{
                        width: '100%',
                        height: '450px',
                        flexShrink: 0,
                        backgroundColor: '#f5f5f5',
                        overflow: 'hidden',
                        borderRadius: '8px',
                    }}>
                        {!showPlaceholder ? (
                            <img
                                src={movie.Poster}
                                alt={movie.Title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                    borderRadius: '8px',
                                }}
                                onError={() => setImageFailed(true)}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                            }}>
                                <MdNoPhotography
                                    size={80}
                                    color="#ccc"
                                    style={{ opacity: 0.7 }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Column */}
                <div style={{ flex: 1 }}>
                    <h1 style={{
                        fontSize: '28px',
                        lineHeight: '1.3',
                        marginBottom: '16px',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%'
                    }}>
                        {movie.Title}
                    </h1>                    <p><strong>Year:</strong> {movie.Year}</p>
                    <p><strong>Genre:</strong> {movie.Genre}</p>
                    <p><strong>Director:</strong> {movie.Director}</p>
                    <p><strong>Actors:</strong> {movie.Actors}</p>
                    <p><strong>Runtime:</strong> {movie.Runtime}</p>
                    <p><strong>IMDB Rating:</strong> {movie.imdbRating}</p>

                    <div style={{ marginTop: '20px' }}>
                        <h3>Plot</h3>
                        <p style={{ lineHeight: '1.6' }}>{movie.Plot}</p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                        {fromWatchlist ? (
                            // Coming from Watchlist - Show Back button + Remove button (swapped)
                            <>
                                <Link to="/watchlist" style={{ textDecoration: 'none' }}>
                                    <button
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#008080',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        ← back to watchlist
                                    </button>
                                </Link>
                                <button
                                    onClick={handleRemoveFromWatchlist}
                                    disabled={isRemoving}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#800000',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '16px',
                                        cursor: isRemoving ? 'default' : 'pointer',
                                    }}
                                >
                                    {isRemoving ? 'Removing...' : 'Remove from Watchlist'}
                                </button>
                            </>
                        ) : (
                            // Coming from Search - Show Back button + Add button (swapped)
                            <>
                                <Link
                                    to={location.state?.fromSearch ? `/?search=${encodeURIComponent(location.state.fromSearch)}` : '/'}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <button
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#008080',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        ← back to search
                                    </button>
                                </Link>
                                <button
                                    onClick={handleAddToWatchlist}
                                    disabled={isAdding || addedToWatchlist}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: addedToWatchlist ? '#6c757d' : '#008080',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '16px',
                                        cursor: addedToWatchlist ? 'default' : 'pointer',
                                    }}
                                >
                                    {isAdding ? 'Adding...' : addedToWatchlist ? 'In Watchlist' : 'add to watchlist'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;