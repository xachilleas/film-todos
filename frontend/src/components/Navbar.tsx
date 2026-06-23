// frontend/src/components/Navbar.tsx

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setTimeout(() => {
            navigate('/');
        }, 0);
    };

    // --- NEW: Handle going to Home with clear state ---
    const goToHome = () => {
        navigate('/', {
            state: { clearSearch: true }  // ← Tell Home to clear everything
        });
    };

    return (
        <nav className="navbar">
            <div className="nav-container-main">
                {/* Logo/Brand - now uses goToHome */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <button
                        onClick={goToHome}
                        className="navbar-brand-button"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '40px',
                            fontWeight: 'bold',
                            color: '#000000',
                            padding: 0,
                            fontFamily: 'Kreon, serif',
                            lineHeight: 1.1
                        }}
                    >
                        film-todos
                    </button>
                    <span style={{
                        fontSize: '15px',
                        color: '#999',
                        fontFamily: 'Kreon, serif',
                        letterSpacing: '0.3px',
                        marginTop: '2px'
                    }}>
        movie search engine &amp; personal watchlist service
    </span>
                </div>

                {/* Navigation Links */}
                <div className="navbar-links">
                    {/* Search link - now uses goToHome */}
                    <button
                        onClick={goToHome}
                        className="nav-link-button"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#008080',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontFamily: 'Kreon, serif',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        search
                    </button>

                    {user ? (
                        <>
                            <Link to="/watchlist" className="nav-link">my watchlist</Link>
                            <span className="navbar-user">🔒{user.username || user.email}</span>
                            <button onClick={handleLogout} className="logout-button" style={{ fontFamily: 'Kreon, serif', backgroundColor: '#800000' }}>
                                logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-link">login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;