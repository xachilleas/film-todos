// frontend/src/components/Navbar.tsx

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();  // Clear auth state
        // Navigate after state clears
        setTimeout(() => {
            navigate('/');
        }, 0);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo/Brand */}
                <Link to="/" className="navbar-brand">
                    🎬 Film-Todos
                </Link>

                {/* Navigation Links */}
                <div className="navbar-links">
                    {/* Search link - always visible */}
                    <Link to="/" className="nav-link">Search</Link>

                    {user ? (
                        // Logged in - show watchlist, user info, and logout
                        <>
                            <Link to="/watchlist" className="nav-link">My Watchlist</Link>
                            <span className="navbar-user">👋 {user.username || user.email}</span>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        // Not logged in - show login link
                        <Link to="/login" className="nav-link">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;