/**
 * Application Entry Point
 * Initializes the React application with root component and providers.
 * Sets up global styles, font, and authentication context.
 *
 * @module main
 * @requires react
 * @requires react-dom/client
 * @requires ./App
 * @requires ./contexts/AuthContext
 * @requires @fontsource/kreon
 * @requires ./index.css
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Import Kreon font from Fontsource package
import '@fontsource/kreon/400.css';  // Regular weight
import '@fontsource/kreon/500.css';  // Medium weight
import '@fontsource/kreon/600.css';  // Semi-bold weight
import '@fontsource/kreon/700.css';  // Bold weight

// Import global CSS styles
import './index.css';

/**
 * Set the global font family to Kreon
 * This applies the font to the entire application
 */
document.body.style.fontFamily = 'Kreon, serif';

/**
 * Create the React root element and render the application
 *
 * Wrapped in React.StrictMode for development checks
 * AuthProvider provides authentication state to all child components
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);