const Footer = () => {
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
            <p>© {currentYear} film-todos Achilleas CF9 assignment All rights reserved.</p>
        </footer>
    );
};

export default Footer;