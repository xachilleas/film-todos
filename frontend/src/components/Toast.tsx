// frontend/src/components/Toast.tsx

import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number; // in milliseconds
    onClose: () => void;
}

const Toast = ({ message, type = 'success', duration = 2000, onClose }: ToastProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#007bff'
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