/**
 * Navbar Component
 * Main navigation bar for the application.
 * Displays brand, navigation links, and user authentication status.
 *
 * @module Navbar
 * @requires react-router-dom
 * @requires ../contexts/AuthContext
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Navbar Component
 *
 * Features:
 * - Brand logo that navigates to home with search reset
 * - Search button that navigates to home with search reset
 * - Watchlist link (authenticated users only)
 * - User display with username/email
 * - Login/Logout buttons
 *
 * @returns {React.ReactElement} Rendered navigation bar
 */
const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /**
     * Handles user logout
     * Clears authentication state and redirects to home
     */
    const handleLogout = (): void => {
        logout();
        // Navigate after logout is complete
        setTimeout(() => {
            navigate('/');
        }, 0);
    };

    /**
     * Navigates to home page with search reset flag
     * This clears any previous search results when clicking the brand or search link
     */
    const goToHome = (): void => {
        navigate('/', {
            state: { clearSearch: true }
        });
    };

    return (
        <nav className="navbar">
            <div className="nav-container-main">
                {/* Brand Section - Logo and Tagline */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                }}>
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

                {/* Navigation Links Section */}
                <div className="navbar-links">
                    {/* Search Button - Navigates to home with search reset */}
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

                    {/* Authenticated User Links */}
                    {user ? (
                        <>
                            <Link to="/watchlist" className="nav-link">
                                my watchlist
                            </Link>
                            <span className="navbar-user">
                                {user.username || user.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="logout-button"
                                style={{
                                    fontFamily: 'Kreon, serif',
                                    backgroundColor: '#800000'
                                }}
                            >
                                logout
                            </button>
                        </>
                    ) : (
                        // Unauthenticated User Links
                        <Link to="/login" className="nav-link">
                            login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;