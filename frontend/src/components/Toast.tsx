/**
 * Toast Notification Component
 * Displays temporary popup notifications for user feedback.
 * Auto-dismisses after a configurable duration with fade-out animation.
 *
 * @module Toast
 * @requires react
 */

import React from 'react';
import { useEffect, useState } from 'react';

/**
 * Toast Component Props
 */
interface ToastProps {
    /** Message to display in the toast */
    message: string;
    /** Type of toast - determines background color */
    type?: 'success' | 'error' | 'info';
    /** Duration in milliseconds before auto-dismiss (default: 2000ms) */
    duration?: number;
    /** Callback function when toast is closed */
    onClose: () => void;
}

/**
 * Toast Notification Component
 *
 * Features:
 * - Auto-dismisses after specified duration
 * - Smooth fade-in animation
 * - Three color variants (success, error, info)
 * - Centered at bottom of screen
 * - Responsive with max-width 90%
 *
 * @param {ToastProps} props - Component props
 * @returns {React.ReactElement | null} Rendered toast or null if hidden
 *
 * @example
 * // Success toast
 * <Toast message="Movie added to watchlist!" type="success" onClose={handleClose} />
 *
 * @example
 * // Error toast with custom duration
 * <Toast message="Something went wrong" type="error" duration={3000} onClose={handleClose} />
 */
const Toast = ({
                   message,
                   type = 'success',
                   duration = 2000,
                   onClose
               }: ToastProps): React.ReactElement | null => {
    const [isVisible, setIsVisible] = useState<boolean>(true);

    /**
     * Set up auto-dismiss timer
     * - After duration, trigger fade-out
     * - After fade-out (300ms), call onClose to remove component
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Wait for fade-out animation to complete before calling onClose
            setTimeout(onClose, 300);
        }, duration);

        // Cleanup timer if component unmounts early
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    // Don't render if not visible
    if (!isVisible) return null;

    /**
     * Color mapping for toast types
     */
    const colors = {
        success: '#28a745', // Green
        error: '#dc3545',   // Red
        info: '#007bff'     // Blue
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: colors[type],
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '16px',
            zIndex: 1000,
            animation: 'fadeInUp 0.3s ease-out',
            maxWidth: '90%',
            textAlign: 'center',
        }}>
            {message}
        </div>
    );
};

export default Toast;