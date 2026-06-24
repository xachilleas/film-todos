/**
 * User Repository
 * Handles database operations for the Users table.
 * Provides CRUD operations for user management with type safety.
 *
 * @module UserRepository
 * @requires ../utils/db
 */

import { getPool } from '../utils/db';

/**
 * User Interface
 * Represents a user record in the database
 *
 * @property {number} [id] - Unique user identifier (auto-generated)
 * @property {string} username - Unique username for login
 * @property {string} email - Unique email address
 * @property {string} password - Hashed password (never store plain text!)
 * @property {Date} [created_at] - Account creation timestamp (auto-generated)
 */
export interface User {
    id?: number;
    username: string;
    email: string;
    password: string;
    created_at?: Date;
}

/**
 * User Repository Class
 * Encapsulates all database operations related to users
 * Follows the Repository pattern - acts as a bridge between application logic and database
 */
export class UserRepository {

    /**
     * Creates a new user in the database
     * Uses OUTPUT INSERTED to return the newly created user with auto-generated fields
     *
     * @param {Omit<User, 'id' | 'created_at'>} user - User data without auto-generated fields
     * @returns {Promise<User>} The created user with id and created_at populated
     *
     * @throws {Error} If database operation fails (e.g., duplicate email/username)
     *
     * @example
     * const newUser = await userRepository.create({
     *   username: 'john_doe',
     *   email: 'john@example.com',
     *   password: 'hashedPassword123'
     * });
     * console.log(newUser.id); // 1
     */
    async create(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
        const pool = getPool();

        const result = await pool.request()
            .input('username', user.username)
            .input('email', user.email)
            .input('password', user.password)
            .query(`
                INSERT INTO Users (username, email, password)
                    OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.created_at
                VALUES (@username, @email, @password)
            `);

        return result.recordset[0];
    }

    /**
     * Finds a user by their email address
     * Used for login authentication and checking duplicate emails
     *
     * @param {string} email - User's email address to search for
     * @returns {Promise<User | null>} User object if found, null otherwise
     *
     * @example
     * const user = await userRepository.findByEmail('john@example.com');
     * if (user) {
     *   // User exists, check password
     * } else {
     *   // User not found
     * }
     */
    async findByEmail(email: string): Promise<User | null> {
        const pool = getPool();

        const result = await pool.request()
            .input('email', email)
            .query('SELECT * FROM Users WHERE email = @email');

        return result.recordset[0] || null;
    }

    /**
     * Finds a user by their username
     * Used for checking duplicate usernames during registration
     *
     * @param {string} username - User's username to search for
     * @returns {Promise<User | null>} User object if found, null otherwise
     *
     * @example
     * const user = await userRepository.findByUsername('john_doe');
     * if (user) {
     *   // Username is taken
     * } else {
     *   // Username is available
     * }
     */
    async findByUsername(username: string): Promise<User | null> {
        const pool = getPool();

        const result = await pool.request()
            .input('username', username)
            .query('SELECT * FROM Users WHERE username = @username');

        return result.recordset[0] || null;
    }

    /**
     * Finds a user by their ID
     * Used for authentication and retrieving user data
     *
     * @param {number} id - User's unique identifier
     * @returns {Promise<User | null>} User object if found, null otherwise
     *
     * @example
     * const user = await userRepository.findById(1);
     * if (user) {
     *   // User exists, return user data
     * }
     */
    async findById(id: number): Promise<User | null> {
        const pool = getPool();

        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Users WHERE id = @id');

        return result.recordset[0] || null;
    }
}