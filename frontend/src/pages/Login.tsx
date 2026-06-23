import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the page they came from (default to home)
    const from = location.state?.from || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate(from);  // Redirect back to where they came from
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const goToRegister = () => {
        navigate('/register');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">welcome back</h2>
                <p className="auth-subtitle">login to your film-Todos account</p>

                {error && <div className="auth-error">{error}</div>}

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