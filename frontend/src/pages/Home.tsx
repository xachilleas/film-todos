import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { movieService } from '../services/movieService';
import type { Movie } from '../services/movieService';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [error, setError] = useState('');

    const { user } = useAuth();

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setError('Please enter a movie title');
            return;
        }

        setLoading(true);
        setError('');
        setMovies([]);

        try {
            const results = await movieService.searchMovies(searchTerm);
            setMovies(results);

            if (results.length === 0) {
                setError('No movies found');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to search movies');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>🎬 Search Movies</h1>
            {user && <p>Welcome, {user.username}!</p>}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '16px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {movies.map((movie) => (
                    <Link
                        key={movie.imdbID}
                        to={`/movie/${movie.imdbID}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <img
                                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster'}
                                alt={movie.Title}
                                style={{ width: '100%', height: 'auto' }}
                            />
                            <div style={{ padding: '10px' }}>
                                <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>{movie.Title}</h3>
                                <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>{movie.Year}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {!loading && movies.length === 0 && !error && (
                <p style={{ textAlign: 'center', color: '#666' }}>Search for movies above</p>
            )}
        </div>
    );
};

export default Home;