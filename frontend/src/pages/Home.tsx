/**
 * Home Page Component
 * Main page for searching and displaying movies.
 * Features search functionality, movie grid display, and poster fallback handling.
 *
 * @module Home
 * @requires react
 * @requires react-router-dom
 * @requires ../contexts/AuthContext
 * @requires ../services/movieService
 * @requires react-icons/md
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { movieService } from '../services/movieService';
import type { Movie } from '../services/movieService';
import { MdNoPhotography } from 'react-icons/md';

/**
 * Home Page Component
 *
 * Features:
 * - Movie search with enter key support
 * - Grid display of movie posters
 * - Poster fallback with Material Design icon
 * - Loading state during search
 * - Error handling for failed searches
 * - Welcome message for authenticated users
 * - URL search parameter synchronization
 * - Hover effect on movie cards
 *
 * @returns {JSX.Element} Rendered home page
 */
const Home = () => {
    // State management
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [error, setError] = useState<string>('');
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    // Hooks
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    /**
     * Performs movie search using the movie service
     *
     * @param {string} term - Search term to look for
     */
    const performSearch = async (term: string): Promise<void> => {
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

    /**
     * Handle URL search parameters and clear search state
     * - Clears search when navigating from navbar
     * - Performs search when URL has 'search' parameter
     */
    useEffect(() => {
        // Clear search state when requested (from navbar navigation)
        if (location.state?.clearSearch) {
            setSearchTerm('');
            setMovies([]);
            setError('');
            setFailedImages(new Set());
            navigate('/', { replace: true, state: {} });
            return;
        }

        // Check for search query in URL parameters
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search');

        if (searchQuery) {
            setSearchTerm(searchQuery);
            performSearch(searchQuery);
        }
    }, [location.search, location.state]);

    /**
     * Handle search form submission
     * Updates URL and performs search
     */
    const handleSearch = async (): Promise<void> => {
        if (!searchTerm.trim()) {
            setError('Please enter a movie title');
            return;
        }

        // Update URL with search parameter
        navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`, { replace: true });
        await performSearch(searchTerm.trim());
    };

    return (
        <div className="home-container">
            {/* Page Header */}
            <h2 style={{ fontSize: '20px', fontWeight: '400', color: '#666', marginBottom: '10px' }}>
                search movies
            </h2>

            {/* Welcome Message for Authenticated Users */}
            {user && <p>welcome, {user.username}!</p>}

            {/* Search Bar */}
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

            {/* Error Display */}
            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

            {/* Movie Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {movies.map((movie) => {
                    // Determine if poster placeholder should be shown
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
                                {/* Movie Poster */}
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
                                            <MdNoPhotography
                                                size={64}
                                                color="#ccc"
                                                style={{ opacity: 0.7 }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Movie Info */}
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

            {/* Empty State */}
            {!loading && movies.length === 0 && !error && (
                <p style={{ textAlign: 'center', color: '#666' }}>search for movies above</p>
            )}
        </div>
    );
};

export default Home;