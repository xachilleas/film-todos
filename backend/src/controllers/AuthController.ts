/**
 * Authentication Controller
 * Handles user authentication operations including registration and login.
 * Manages user creation, password hashing, and JWT token generation.
 *
 * @module AuthController
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires ../repositories/UserRepository
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

/**
 * Authentication Controller Class
 * Handles HTTP requests for authentication-related operations
 *
 * Responsibilities:
 * - Register new users
 * - Authenticate existing users (login)
 * - Generate JWT tokens for authenticated users
 */
export class AuthController {
    /** Repository for user database operations */
    private userRepository: UserRepository;

    /**
     * Initializes the AuthController with required dependencies
     */
    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * Handles user registration
     *
     * @param {Request} req - Express request object containing username, email, password
     * @param {Response} res - Express response object
     * @returns {Promise<void>} - Sends JSON response with user data and JWT token
     *
     * @example
     * // POST /api/auth/register
     * // Request body: { username: "john_doe", email: "john@example.com", password: "password123" }
     * // Response: { status: "success", message: "User registered successfully", data: { token, user } }
     */
    register = async (req: Request, res: Response): Promise<void> => {
        const { username, email, password } = req.body;

        /**
         * Check if email is already registered
         * Email must be unique in the system
         */
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            res.status(400).json({ message: "Email already registered" });
            return;
        }

        /**
         * Hash the password before storing in database
         * Salt rounds: 10 - provides good security vs performance balance
         */
        const hashedPassword = await bcrypt.hash(password, 10);

        /**
         * Create the new user in the database
         * Only store the hashed password, never plain text
         */
        const newUser = await this.userRepository.create({
            username,
            email,
            password: hashedPassword
        });

        /**
         * Generate JWT token for the newly registered user
         * Token includes userId and email for authentication
         * Expires in 7 days
         */
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        /**
         * Send success response with token and user data
         * Exclude password hash from response for security
         */
        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: {
                token: token,
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                }
            }
        });
    }

    /**
     * Handles user login
     *
     * @param {Request} req - Express request object containing email and password
     * @param {Response} res - Express response object
     * @returns {Promise<void>} - Sends JSON response with user data and JWT token
     *
     * @example
     * // POST /api/auth/login
     * // Request body: { email: "john@example.com", password: "password123" }
     * // Response: { status: "success", message: "Login successful", data: { token, user } }
     */
    login = async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        /**
         * Find user by email
         * If user doesn't exist, authentication fails
         */
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        /**
         * Compare provided password with stored hashed password
         * bcrypt.compare handles the hashing verification
         */
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        /**
         * Generate JWT token for authenticated user
         * Token includes userId and email for session management
         * Expires in 7 days
         */
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        /**
         * Send success response with token and user data
         * Exclude password hash from response for security
         */
        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    }
}