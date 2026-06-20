import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { MovieDetail } from '../services/movieService';
import { watchlistService } from '../services/watchlistService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MovieDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [addedToWatchlist, setAddedToWatchlist] = useState(false);
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!id) return;

            setLoading(true);
            setError('');

            try {
                const data = await movieService.getMovieDetails(id);
                console.log('🎬 Full movie data:', data);  // <-- ADD THIS
                console.log('📝 Keys in movie object:', Object.keys(data));  // <-- ADD THIS
                setMovie(data);
            } catch (err: any) {
                console.error('❌ Error fetching movie:', err);  // <-- ADD THIS
                setError(err.response?.data?.message || 'Failed to load movie details');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    const handleAddToWatchlist = async () => {
        // Check if user is authenticated
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

    if (loading) return <div style={{ padding: '20px' }}>Loading movie details...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    if (!movie) return <div style={{ padding: '20px' }}>Movie not found</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
                ← Back to Search
            </Link>

            <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
                <div style={{ flex: '0 0 300px' }}>
                    <img
                        src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                        alt={movie.Title}
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </div>

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

                    <button
                        onClick={handleAddToWatchlist}
                        disabled={isAdding || addedToWatchlist}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            backgroundColor: addedToWatchlist ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: addedToWatchlist ? 'default' : 'pointer',
                        }}
                    >
                        {isAdding ? 'Adding...' : addedToWatchlist ? '✅ In Watchlist' : 'Add to Watchlist'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;