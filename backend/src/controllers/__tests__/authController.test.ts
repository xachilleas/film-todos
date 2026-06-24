/**
 * Authentication Controller Tests
 * Unit tests for AuthController using Jest with mocked dependencies.
 * Tests registration and login functionality including success and error cases.
 *
 * @module authController.test
 * @requires ../AuthController
 * @requires ../../repositories/UserRepository
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires express
 */

import { AuthController } from '../AuthController';
import { UserRepository } from '../../repositories/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

// Mock all external dependencies
jest.mock('../../repositories/UserRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
    let authController: AuthController;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    /**
     * Creates a mock response object with jest.fn() methods
     * Provides a fresh mock for each test to ensure isolation
     */
    const createMockResponse = (): Partial<Response> => {
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        return res;
    };

    /**
     * Setup before each test
     * Clears all mocks, creates fresh instances, and sets up test environment
     */
    beforeEach(() => {
        // Reset all mock state before each test
        jest.clearAllMocks();

        // Create mocked repository instance
        mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;

        // Create controller and inject mocked repository
        authController = new AuthController();
        (authController as any).userRepository = mockUserRepository;

        // Create fresh request and response objects
        mockReq = {};
        mockRes = createMockResponse();
        mockNext = jest.fn();

        // Ensure JWT secret is available for tests
        process.env.JWT_SECRET = 'test-secret-key';
    });

    // ============================================================================
    // REGISTER TESTS
    // ============================================================================

    describe('register', () => {
        /**
         * Test: Successful user registration
         *
         * Flow:
         * 1. User submits username, email, password
         * 2. System checks if email is already registered
         * 3. System hashes the password
         * 4. System creates user in database
         * 5. System generates JWT token
         * 6. System returns success response with token and user data
         */
        it('should register a new user successfully', async () => {
            // --- ARRANGE ---
            const mockUserData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            mockReq.body = mockUserData;

            // Mock: No existing user found (email is available)
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // Mock: Password hashing returns hashed value
            const mockHashedPassword = 'hashed_password_123';
            (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

            // Mock: User creation returns new user with ID
            const mockCreatedUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: mockHashedPassword,
                created_at: new Date()
            };
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            // Mock: JWT token generation
            const mockToken = 'fake.jwt.token';
            (jwt.sign as jest.Mock).mockReturnValue(mockToken);

            // --- ACT ---
            await authController.register(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Verify repository methods were called with correct parameters
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@example.com',
                password: mockHashedPassword
            });
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 1, email: 'test@example.com' },
                'test-secret-key',
                { expiresIn: '7d' }
            );

            // Verify response
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'User registered successfully',
                data: {
                    token: mockToken,
                    user: {
                        id: 1,
                        username: 'testuser',
                        email: 'test@example.com'
                    }
                }
            });
        });

        /**
         * Test: Registration fails when email is already taken
         *
         * Flow:
         * 1. User submits email that already exists
         * 2. System detects duplicate email
         * 3. System returns 400 error without creating user
         */
        it('should return 400 if email is already registered', async () => {
            // --- ARRANGE ---
            const mockUserData = {
                username: 'testuser',
                email: 'existing@example.com',
                password: 'password123'
            };

            mockReq.body = mockUserData;

            // Mock: Email already exists in database
            const existingUser = {
                id: 1,
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'hashed_password'
            };
            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            // --- ACT ---
            await authController.register(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Verify no user creation or password hashing occurred
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockUserRepository.create).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();

            // Verify error response
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Email already registered'
            });
        });

        /**
         * Test: Registration handles database errors gracefully
         *
         * Flow:
         * 1. User submits valid data
         * 2. Database operation fails during user creation
         * 3. Error is thrown and should be caught by error handler
         *
         * Note: This test expects an error to be thrown because the controller
         * doesn't have try-catch for database errors (they're handled by global handler)
         */
        it('should throw error if database operation fails during registration', async () => {
            // --- ARRANGE ---
            const mockUserData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            mockReq.body = mockUserData;

            // Mock: No existing user
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // Mock: Password hashing succeeds
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

            // Mock: Database error during user creation
            const dbError = new Error('Database connection failed');
            mockUserRepository.create.mockRejectedValue(dbError);

            // --- ACT & ASSERT ---
            // Expect the error to propagate to the global error handler
            await expect(
                authController.register(mockReq as Request, mockRes as Response)
            ).rejects.toThrow('Database connection failed');

            // Verify no response was sent (error thrown before response)
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    // ============================================================================
    // LOGIN TESTS
    // ============================================================================

    describe('login', () => {
        /**
         * Test: Successful user login
         *
         * Flow:
         * 1. User submits email and password
         * 2. System finds user by email
         * 3. System verifies password matches
         * 4. System generates JWT token
         * 5. System returns success response with token and user data
         */
        it('should login user successfully with correct credentials', async () => {
            // --- ARRANGE ---
            const mockLoginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockReq.body = mockLoginData;

            // Mock: User found in database
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashed_password_123',
                created_at: new Date()
            };
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            // Mock: Password verification succeeds
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            // Mock: JWT token generation
            const mockToken = 'fake.jwt.token';
            (jwt.sign as jest.Mock).mockReturnValue(mockToken);

            // --- ACT ---
            await authController.login(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Verify repository and bcrypt were called correctly
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password_123');
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 1, email: 'test@example.com' },
                'test-secret-key',
                { expiresIn: '7d' }
            );

            // Verify success response
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Login successful',
                data: {
                    token: mockToken,
                    user: {
                        id: 1,
                        username: 'testuser',
                        email: 'test@example.com'
                    }
                }
            });
        });

        /**
         * Test: Login fails when user is not found
         *
         * Flow:
         * 1. User submits email that doesn't exist
         * 2. System returns 401 with generic message
         * 3. No password check or token generation occurs
         *
         * Security: Generic error message prevents email enumeration
         */
        it('should return 401 if user not found', async () => {
            // --- ARRANGE ---
            const mockLoginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            mockReq.body = mockLoginData;

            // Mock: User NOT found in database
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // --- ACT ---
            await authController.login(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Verify no password check or token generation occurred
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();

            // Verify error response
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid email or password'
            });
        });

        /**
         * Test: Login fails when password is incorrect
         *
         * Flow:
         * 1. User submits correct email but wrong password
         * 2. System finds user but password verification fails
         * 3. System returns 401 with generic message
         */
        it('should return 401 if password is incorrect', async () => {
            // --- ARRANGE ---
            const mockLoginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            mockReq.body = mockLoginData;

            // Mock: User found in database
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashed_password_123',
                created_at: new Date()
            };
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            // Mock: Password verification fails
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // --- ACT ---
            await authController.login(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Verify no token was generated
            expect(jwt.sign).not.toHaveBeenCalled();

            // Verify error response
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid email or password'
            });
        });

        /**
         * Test: Login handles database errors
         *
         * Flow:
         * 1. User submits valid credentials
         * 2. Database query fails
         * 3. Error propagates to global error handler
         */
        it('should throw error if database query fails during login', async () => {
            // --- ARRANGE ---
            const mockLoginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockReq.body = mockLoginData;

            // Mock: Database error during user lookup
            const dbError = new Error('Database connection failed');
            mockUserRepository.findByEmail.mockRejectedValue(dbError);

            // --- ACT & ASSERT ---
            await expect(
                authController.login(mockReq as Request, mockRes as Response)
            ).rejects.toThrow('Database connection failed');

            // Verify no response was sent
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    // ============================================================================
    // JWT CONFIGURATION TESTS
    // ============================================================================

    describe('JWT configuration', () => {
        /**
         * Test: Registration fails when JWT_SECRET is missing
         *
         * Flow:
         * 1. JWT_SECRET environment variable is not set
         * 2. User registration attempts to generate token
         * 3. System throws error
         *
         * Security: This ensures the application fails safely when misconfigured
         */
        it('should throw error if JWT_SECRET environment variable is missing', async () => {
            // --- ARRANGE ---
            const mockUserData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            mockReq.body = mockUserData;

            // Remove JWT_SECRET for this test
            delete process.env.JWT_SECRET;

            // Mock: No existing user
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // Mock: Password hashing succeeds
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

            // Mock: User creation succeeds
            const mockCreatedUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashed_password',
                created_at: new Date()
            };
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            // Mock: JWT sign throws error when secret is missing
            (jwt.sign as jest.Mock).mockImplementation(() => {
                throw new Error('JWT_SECRET is not defined');
            });

            // --- ACT & ASSERT ---
            await expect(
                authController.register(mockReq as Request, mockRes as Response)
            ).rejects.toThrow('JWT_SECRET is not defined');
        });
    });
});