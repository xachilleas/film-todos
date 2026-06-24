import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { MovieDetail } from '../services/movieService';
import { watchlistService } from '../services/watchlistService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MdNoPhotography } from 'react-icons/md';


const MovieDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isAdding, setIsAdding] = useState(false);
    const [addedToWatchlist, setAddedToWatchlist] = useState(false);
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageFailed, setImageFailed] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    // Check if user came from watchlist
    const fromWatchlist = location.state?.fromWatchlist || false;



    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!id) return;

            setLoading(true);
            setError('');
            setImageFailed(false);


            try {
                const data = await movieService.getMovieDetails(id);
                console.log('🎬 Full movie data:', data);
                console.log('📝 Keys in movie object:', Object.keys(data));
                setMovie(data);
            } catch (err: any) {
                console.error('❌ Error fetching movie:', err);
                setError(err.response?.data?.message || 'Failed to load movie details');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    const handleAddToWatchlist = async () => {
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

    const handleRemoveFromWatchlist = async () => {
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
            // Optionally navigate back to watchlist after removal
            navigate('/watchlist');
        } catch (error: any) {
            alert('Failed to remove from watchlist. Please try again.');
            console.error('Error removing movie:', error);
        } finally {
            setIsRemoving(false);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading movie details...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    if (!movie) return <div style={{ padding: '20px' }}>Movie not found</div>;

    const showPlaceholder = !movie.Poster ||
        movie.Poster === 'N/A' ||
        movie.Poster === '' ||
        imageFailed;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            {fromWatchlist ? (
                <Link
                    to="/watchlist"
                    style={{ textDecoration: 'none', color: '#007bff' }}
                >
                    ← back to watchlist
                </Link>
            ) : (
                <Link
                    to={location.state?.fromSearch ? `/?search=${encodeURIComponent(location.state.fromSearch)}` : '/'}
                    style={{ textDecoration: 'none', color: '#008080' }}
                >
                    ← back to search results
                </Link>
            )}

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
                    <h1>{movie.Title}</h1>
                    <p><strong>Year:</strong> {movie.Year}</p>
                    <p><strong>Genre:</strong> {movie.Genre}</p>
                    <p><strong>Director:</strong> {movie.Director}</p>
                    <p><strong>Actors:</strong> {movie.Actors}</p>
                    <p><strong>Runtime:</strong> {movie.Runtime}</p>
                    <p><strong>IMDB Rating:</strong> ⭐ {movie.imdbRating}</p>

                    <div style={{ marginTop: '20px' }}>
                        <h3>Plot</h3>
                        <p style={{ lineHeight: '1.6' }}>{movie.Plot}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                        {fromWatchlist ? (
                            // Coming from Watchlist - Show Remove button + Back to Watchlist
                            <>
                                <button
                                    onClick={handleRemoveFromWatchlist}
                                    disabled={isRemoving}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '16px',
                                        cursor: isRemoving ? 'default' : 'pointer',
                                    }}
                                >
                                    {isRemoving ? 'Removing...' : '🗑️ Remove from Watchlist'}
                                </button>
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
                            </>
                        ) : (
                            // Coming from Search - Show Add button + Back to Search
                            <>
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
                                    {isAdding ? 'Adding...' : addedToWatchlist ? '✅ In Watchlist' : 'add to watchlist'}
                                </button>
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;