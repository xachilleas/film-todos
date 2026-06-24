/**
 * Authentication Context
 * Provides authentication state and methods to all components.
 * Manages user login, registration, logout, and token persistence.
 *
 * @module AuthContext
 * @requires react
 * @requires ../services/api
 * @requires ../types
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { User, AuthResponse } from '../types';

/**
 * Authentication Context Type
 * Defines the shape of the auth context value
 */
interface AuthContextType {
    /** Currently authenticated user or null if not logged in */
    user: User | null;
    /** JWT token for API authentication or null if not logged in */
    token: string | null;
    /** Indicates if auth state is still being loaded from localStorage */
    loading: boolean;
    /** Login with email and password */
    login: (email: string, password: string) => Promise<void>;
    /** Register a new user */
    register: (username: string, email: string, password: string) => Promise<void>;
    /** Logout the current user */
    logout: () => void;
}

/**
 * Create the authentication context
 * Initialized with undefined to enforce usage within AuthProvider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use authentication context
 *
 * @returns {AuthContextType} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * const { user, login, logout } = useAuth();
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
    /** Child components that will have access to auth context */
    children: ReactNode;
}

/**
 * Authentication Provider Component
 * Wraps the application and provides authentication state to all children.
 *
 * Features:
 * - Persists auth state in localStorage
 * - Restores session on app reload
 * - Handles login, registration, and logout
 * - Manages loading state for initial auth check
 *
 * @param {AuthProviderProps} props - Component props
 * @returns {JSX.Element} Auth provider with children
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Authentication state
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Check for existing authentication on app load
     * Restores session from localStorage if available
     */
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    /**
     * Login a user with email and password
     *
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<void>}
     * @throws {Error} If login fails
     */
    const login = async (email: string, password: string): Promise<void> => {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        const { token, user } = response.data.data;

        // Persist authentication state
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update application state
        setToken(token);
        setUser(user);
    };

    /**
     * Register a new user
     *
     * @param {string} username - Desired username
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<void>}
     * @throws {Error} If registration fails
     */
    const register = async (username: string, email: string, password: string): Promise<void> => {
        const response = await api.post<AuthResponse>('/auth/register', { username, email, password });
        const { token, user } = response.data.data;

        // Persist authentication state
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update application state
        setToken(token);
        setUser(user);
    };

    /**
     * Logout the current user
     * Removes authentication state and clears localStorage
     */
    const logout = (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};