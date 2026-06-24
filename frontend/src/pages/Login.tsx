/**
 * Login Page Component
 * Renders the login form for user authentication.
 * Redirects users to their intended destination after successful login.
 *
 * @module Login
 * @requires react
 * @requires react-router-dom
 * @requires ../contexts/AuthContext
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Login Page Component
 *
 * Features:
 * - Email and password form with validation
 * - Error handling with user-friendly messages
 * - Redirect to previous page after login (or home)
 * - Register link for new users
 *
 * @returns {JSX.Element} Rendered login page
 */
const Login: React.FC = () => {
    // Form state
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Hooks
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Get the page the user came from (default to home)
     * Allows redirect back to original destination after login
     */
    const from = location.state?.from || '/';

    /**
     * Handle form submission
     * Attempts login and redirects on success
     * Displays error message on failure
     *
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            // Redirect to the page they were trying to access
            navigate(from);
        } catch (err: any) {
            // Display user-friendly error message
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    /**
     * Navigate to registration page
     */
    const goToRegister = (): void => {
        navigate('/register');
    };

    return (
        <div className="auth-container login-page">
            <div className="auth-card">
                <h2 className="auth-title">welcome back</h2>
                <p className="auth-subtitle">login to your film-todos account</p>

                {/* Display error message if present */}
                {error && <div className="auth-error">{error}</div>}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button">
                        login
                    </button>
                </form>

                {/* Redirect to Register */}
                <p className="auth-redirect">
                    don't have an account?{' '}
                    <button
                        onClick={goToRegister}
                        className="link-button"
                    >
                        register here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;