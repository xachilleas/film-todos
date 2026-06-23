import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { movieService } from '../services/movieService';
import type { Movie } from '../services/movieService';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [error, setError] = useState('');
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const performSearch = async (term: string) => {
        if (!term.trim()) {
            setError('Please enter a movie title');
            return;
        }

        setLoading(true);
        setError('');
        setMovies([]);
        setFailedImages(new Set());

        try {
            const results = await movieService.searchMovies(term);
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

    useEffect(() => {
        if (location.state?.clearSearch) {
            setSearchTerm('');
            setMovies([]);
            setError('');
            setFailedImages(new Set());
            navigate('/', { replace: true, state: {} });
            return;
        }

        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search');

        if (searchQuery) {
            setSearchTerm(searchQuery);
            performSearch(searchQuery);
        }
    }, [location.search, location.state]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setError('Please enter a movie title');
            return;
        }

        navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`, { replace: true });
        await performSearch(searchTerm.trim());
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 180px)',
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%'
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: '400', color: '#666', marginBottom: '10px' }}>
                search movies
            </h2>
            {user && <p>welcome, {user.username}!</p>}

            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                width: '100%',
                maxWidth: '600px'
            }}>
                <input
                    type="text"
                    placeholder="search for a movie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '16px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontFamily: 'Kreon, serif'
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#008080',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'Kreon, serif'
                    }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {movies.map((movie) => {
                    const showPlaceholder = !movie.Poster ||
                        movie.Poster === 'N/A' ||
                        movie.Poster === '' ||
                        failedImages.has(movie.imdbID);

                    return (
                        <Link
                            key={movie.imdbID}
                            to={`/movie/${movie.imdbID}`}
                            state={{ fromSearch: searchTerm }}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    backgroundColor: '#fff',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{
                                    width: '100%',
                                    height: '300px',
                                    flexShrink: 0,
                                    backgroundColor: '#f5f5f5',
                                    overflow: 'hidden',
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
                                            }}
                                            onError={() => {
                                                setFailedImages(prev => new Set(prev).add(movie.imdbID));
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: '#f5f5f5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <svg
                                                width="64"
                                                height="64"
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
                                    )}
                                </div>

                                <div style={{
                                    padding: '10px',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                }}>
                                    <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>{movie.Title}</h3>
                                    <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>{movie.Year}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {!loading && movies.length === 0 && !error && (
                <p style={{ textAlign: 'center', color: '#666' }}>search for movies above</p>
            )}
        </div>
    );
};

export default Home;