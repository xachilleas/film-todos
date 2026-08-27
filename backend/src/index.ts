/**
 * Main Server Entry Point
 * Configures and starts the Express server with all middleware, routes,
 * and error handling for the Film-Todos API.
 *
 * @module index
 * @requires express
 * @requires cors
 * @requires dotenv
 */

import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// Custom modules
import { connectDB } from "./utils/db";
import authRoutes from './routes/authRoutes';
import { authMiddleware } from './middleware/auth';
import moviesRoutes from './routes/moviesRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import { specs } from './swagger';
import errorHandler from './middleware/errorHandler';

// Load environment variables from .env file
dotenv.config();

/**
 * Express application instance
 * Configured with middleware, routes, and error handling
 */
const app = express();
const PORT = 3000;

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Enable Cross-Origin Resource Sharing for frontend requests
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Serve Swagger API documentation at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

/**
 * Connect to database with retry logic
 * Waits for SQL Server to be ready before giving up
 */
async function connectWithRetry(retries = 10, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting to connect to database (attempt ${i + 1}/${retries})...`);
            await connectDB();
            console.log('Database connected successfully!');
            return;
        } catch (error: any) {
            console.log(`Database connection failed: ${error.message}`);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.log('All database connection attempts failed. Exiting...');
    process.exit(1);
}

// Start the server after database is connected
async function startServer() {
    await connectWithRetry();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * Root endpoint - basic server availability check
 * @route GET /
 */
app.get("/", (req, res) => {
    res.send("Hello World");
});

/**
 * Simple ping endpoint for health checks
 * @route GET /api/ping
 * @returns {Object} { message: "pong" }
 */
app.get("/api/ping", (req, res) => {
    res.json({ message: "pong" });
});

/**
 * Health check endpoint for monitoring
 * @route GET /api/health
 * @returns {Object} { status: 'OK', message: 'Server is running' }
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

/**
 * Temporary database test route (for development only)
 * @route GET /api/test-db
 * @returns {Object} Success message with timestamp or error
 */
app.get("/api/test-db", async (req, res) => {
    try {
        await connectDB();
        res.json({
            message: "Database connected successfully",
            timestamp: new Date()
        });
    } catch (error: any) {
        res.status(500).json({ error: "Database connection failed" });
    }
});

// ============================================================================
// API ROUTES
// ============================================================================

// Authentication routes (login, register)
app.use('/api/auth', authRoutes);

// Movie search routes (uses OMDb API)
app.use('/api/movies', moviesRoutes);

// Watchlist CRUD routes (requires authentication)
app.use('/api/watchlist', watchlistRoutes);

/**
 * Protected test route to verify JWT authentication
 * @route GET /api/protected-test
 * @middleware authMiddleware - Validates JWT token
 * @returns {Object} Authenticated user's ID and success message
 */
app.get('/api/protected-test', authMiddleware, (req, res) => {
    res.json({
        message: 'You are authenticated!',
        userId: req.userId
    });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 Not Found handler
 * Catches all unmatched routes
 * Must be placed BEFORE the global error handler
 */
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler - catches all application errors
app.use(errorHandler);