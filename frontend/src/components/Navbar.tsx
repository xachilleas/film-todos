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
            <div className="navbar-container">
                {/* Logo/Brand - now uses goToHome */}
                <button
                    onClick={goToHome}
                    className="navbar-brand-button"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 'inherit',
                        fontWeight: 'bold',
                        color: 'inherit',
                        padding: 0,
                    }}
                >
                    🎬 Film-Todos
                </button>

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
                            color: '#007bff',
                            padding: '8px 12px',
                            borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Search
                    </button>

                    {user ? (
                        <>
                            <Link to="/watchlist" className="nav-link">My Watchlist</Link>
                            <span className="navbar-user">👋 {user.username || user.email}</span>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-link">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;