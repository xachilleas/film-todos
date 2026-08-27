/**
 * Main Application Component
 * Sets up routing and layout structure for the entire application.
 * Wraps the app with authentication context and provides navigation.
 *
 * @module App
 * @requires react-router-dom
 * @requires ./components/Navbar
 * @requires ./components/Footer
 * @requires ./pages/Home
 * @requires ./pages/Login
 * @requires ./pages/Register
 * @requires ./pages/MovieDetails
 * @requires ./pages/Watchlist
 * @requires ./contexts/AuthContext
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import Watchlist from './pages/Watchlist';
import { AuthProvider } from './contexts/AuthContext';

/**
 * App Component
 *
 * @returns {React.ReactElement} The rendered application with routing and layout
 *
 * Structure:
 * - AuthProvider: Provides authentication state to all child components
 * - Router: Enables client-side routing
 * - Flex container: Ensures footer stays at bottom
 * - Navbar: Navigation bar at top
 * - Routes: Defines all application routes
 * - Footer: Footer at bottom
 */
function App(): React.ReactElement {
    return (
        <AuthProvider>
            <Router>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh'
                }}>
                    <Navbar />
                    <main style={{ flex: 1 }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/movie/:id" element={<MovieDetails />} />
                            <Route path="/watchlist" element={<Watchlist />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;