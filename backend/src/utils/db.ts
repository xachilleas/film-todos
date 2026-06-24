/**
 * Database Connection Module
 * Manages SQL Server connection pool for the Film-Todos application.
 * Provides connection establishment and pool access functions.
 *
 * @module db
 * @requires mssql
 * @requires dotenv
 */

import sql from 'mssql';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * SQL Server connection configuration
 * Uses environment variables for secure credential management
 *
 * @property {string} server - Database server hostname
 * @property {number} port - Database server port
 * @property {string} database - Target database name
 * @property {string} user - Database username
 * @property {string} password - Database password
 * @property {Object} options - Additional connection options
 */
const config: sql.config = {
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '50720'),
    database: process.env.APP_DATABASE || 'FilmTodosDB',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        trustServerCertificate: true, // Required for local development with self-signed certificates
    }
};

/**
 * Singleton connection pool instance
 * Reused across all database operations for efficiency
 */
let connectionPool: sql.ConnectionPool | null = null;

/**
 * Establishes connection to the SQL Server database
 * Creates a single connection pool that is reused for all queries
 *
 * @returns {Promise<sql.ConnectionPool>} The database connection pool
 * @throws {Error} If connection fails
 *
 * @example
 * // Initialize database connection on server startup
 * await connectDB();
 */
export const connectDB = async (): Promise<sql.ConnectionPool> => {
    if (!connectionPool) {
        connectionPool = await sql.connect(config);
        console.log('Connected to FilmTodosDB');
    }
    return connectionPool;
};

/**
 * Retrieves the database connection pool
 * Must be called after connectDB() has been executed
 *
 * @returns {sql.ConnectionPool} The active database connection pool
 * @throws {Error} If database has not been connected yet
 *
 * @example
 * // Get pool for database operations
 * const pool = getPool();
 * const result = await pool.request().query('SELECT * FROM Users');
 */
export const getPool = (): sql.ConnectionPool => {
    if (!connectionPool) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return connectionPool;
};

// Export sql for direct use in queries
export default sql;