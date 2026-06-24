/**
 * Footer Component
 * Displays the application footer with copyright information.
 * Appears at the bottom of every page.
 *
 * @module Footer
 * @requires react
 */

import React from 'react';

/**
 * Footer Component
 *
 * Features:
 * - Dynamic year display (auto-updates)
 * - Consistent styling across all pages
 * - Copyright notice with assignment attribution
 *
 * @returns {React.ReactElement} Rendered footer
 */
const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            textAlign: 'center',
            borderTop: '1px solid #f0f0f0',
            marginTop: 'auto',
            fontFamily: 'Kreon, serif',
            fontSize: '14px',
            color: '#999'
        }}>
            <p>
                &copy; {currentYear} film-todos - Achilleas CF9 Assignment - All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;