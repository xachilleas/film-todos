/**
 * Register Page Component
 * Renders the registration form for new users.
 * Handles form validation and account creation.
 *
 * @module Register
 * @requires react
 * @requires react-router-dom
 * @requires ../contexts/AuthContext
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Register Page Component
 *
 * Features:
 * - Username, email, and password form with validation
 * - Password confirmation matching
 * - Password length validation (minimum 6 characters)
 * - Loading state during account creation
 * - Redirect to login for existing users
 *
 * @returns {JSX.Element} Rendered registration page
 */
const Register: React.FC = () => {
    // Form state
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Hooks
    const { register } = useAuth();
    const navigate = useNavigate();

    /**
     * Handle form submission
     * Validates input and creates a new user account
     *
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');

        /**
         * Validate passwords match
         */
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        /**
         * Validate password length
         * Backend also validates, but this provides instant feedback
         */
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(username, email, password);
            // Redirect to home on successful registration
            navigate('/');
        } catch (err: any) {
            // Display user-friendly error message from backend
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Navigate to login page
     */
    const goToLogin = (): void => {
        navigate('/login');
    };

    return (
        <div className="auth-container register-page">
            <div className="auth-card">
                <h2 className="auth-title">create account</h2>
                <p className="auth-subtitle">join film-todos and start building your watchlist</p>

                {/* Display error message if present */}
                {error && <div className="auth-error">{error}</div>}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Username Field */}
                    <div className="form-group">
                        <label htmlFor="username">username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            required
                            minLength={3}
                        />
                    </div>

                    {/* Email Field */}
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

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password">password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">confirm password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    {/* Submit Button - Disabled while loading */}
                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'create account'}
                    </button>
                </form>

                {/* Redirect to Login */}
                <p className="auth-redirect">
                    already have an account?{' '}
                    <button
                        onClick={goToLogin}
                        className="link-button"
                    >
                        login here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;