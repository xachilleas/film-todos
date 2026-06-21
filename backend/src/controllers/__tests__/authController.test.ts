// backend/src/controllers/__tests__/authController.test.ts

import { AuthController } from '../AuthController';
import { UserRepository } from '../../repositories/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

// --- MOCK ALL DEPENDENCIES ---
jest.mock('../../repositories/UserRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
    let authController: AuthController;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    // Helper function to create mock response
    const createMockResponse = () => {
        const res: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        return res;
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create mocked repository
        mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;

        // Create controller with mocked repository
        authController = new AuthController();
        // Replace the repository instance with our mock
        (authController as any).userRepository = mockUserRepository;

        // Setup mock request and response
        mockReq = {};
        mockRes = createMockResponse();
        mockNext = jest.fn();

        // Set JWT secret for tests
        process.env.JWT_SECRET = 'test-secret-key';
    });

    // ============================================
    // TEST: REGISTER - SUCCESS
    // ============================================
    describe('register', () => {
        it('should register a new user successfully', async () => {
            // --- ARRANGE ---
            const mockUserData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            mockReq.body = mockUserData;

            // Mock: No existing user found
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // Mock: Hash password
            const mockHashedPassword = 'hashed_password_123';
            (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

            // Mock: Create user in database
            const mockCreatedUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: mockHashedPassword,
                created_at: new Date()
            };
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            // Mock: Generate JWT
            const mockToken = 'fake.jwt.token';
            (jwt.sign as jest.Mock).mockReturnValue(mockToken);

            // --- ACT ---
            await authController.register(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Check that repository methods were called correctly
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

            // Check response
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

        // ============================================
        // TEST: REGISTER - EMAIL ALREADY EXISTS
        // ============================================
        it('should return 400 if email is already registered', async () => {
            // --- ARRANGE ---
            const mockUserData = {
                username: 'testuser',
                email: 'existing@example.com',
                password: 'password123'
            };

            mockReq.body = mockUserData;

            // Mock: Email already exists
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
            // Should NOT try to create user or hash password
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockUserRepository.create).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();

            // Should return error response
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Email already registered'
            });
        });

        // ============================================
        // TEST: REGISTER - HANDLE DATABASE ERROR
        // ============================================
        it('should handle database error during registration', async () => {
            // --- ARRANGE ---
            const mockUserData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            mockReq.body = mockUserData;

            // Mock: No existing user
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // Mock: Hash password
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

            // Mock: Database error during create
            const dbError = new Error('Database connection failed');
            mockUserRepository.create.mockRejectedValue(dbError);

            // We need to catch the error since the controller doesn't have error handling
            // This test will fail if the error is thrown
            // In a real app, you'd have an error handler middleware

            // --- ACT & ASSERT ---
            // The controller currently throws the error (no try-catch)
            await expect(
                authController.register(mockReq as Request, mockRes as Response)
            ).rejects.toThrow('Database connection failed');

            // Response should NOT be called (error thrown before response)
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // TEST: LOGIN - SUCCESS
    // ============================================
    describe('login', () => {
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

            // Mock: Password is valid
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            // Mock: Generate JWT
            const mockToken = 'fake.jwt.token';
            (jwt.sign as jest.Mock).mockReturnValue(mockToken);

            // --- ACT ---
            await authController.login(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Check repository was called correctly
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password_123');
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 1, email: 'test@example.com' },
                'test-secret-key',
                { expiresIn: '7d' }
            );

            // Check response
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

        // ============================================
        // TEST: LOGIN - USER NOT FOUND
        // ============================================
        it('should return 401 if user not found', async () => {
            // --- ARRANGE ---
            const mockLoginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            mockReq.body = mockLoginData;

            // Mock: User NOT found
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // --- ACT ---
            await authController.login(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Should NOT check password or generate token
            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();

            // Should return error response
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid email or password'
            });
        });

        // ============================================
        // TEST: LOGIN - WRONG PASSWORD
        // ============================================
        it('should return 401 if password is incorrect', async () => {
            // --- ARRANGE ---
            const mockLoginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            mockReq.body = mockLoginData;

            // Mock: User found
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashed_password_123',
                created_at: new Date()
            };
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            // Mock: Password is INVALID
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // --- ACT ---
            await authController.login(mockReq as Request, mockRes as Response);

            // --- ASSERT ---
            // Should NOT generate token
            expect(jwt.sign).not.toHaveBeenCalled();

            // Should return error response
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid email or password'
            });
        });

        // ============================================
        // TEST: LOGIN - HANDLE DATABASE ERROR
        // ============================================
        it('should throw error if database query fails during login', async () => {
            // --- ARRANGE ---
            const mockLoginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockReq.body = mockLoginData;

            // Mock: Database error
            const dbError = new Error('Database connection failed');
            mockUserRepository.findByEmail.mockRejectedValue(dbError);

            // --- ACT & ASSERT ---
            await expect(
                authController.login(mockReq as Request, mockRes as Response)
            ).rejects.toThrow('Database connection failed');

            // Response should NOT be called (error thrown before response)
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // BONUS: TEST JWT SECRET MISSING
    // ============================================
    describe('JWT configuration', () => {
        it('should handle missing JWT_SECRET environment variable', async () => {
            // --- ARRANGE ---
            const mockUserData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            mockReq.body = mockUserData;

            // Remove JWT_SECRET
            delete process.env.JWT_SECRET;

            // Mock: No existing user
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // Mock: Hash password
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

            // Mock: Create user
            const mockCreatedUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashed_password',
                created_at: new Date()
            };
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            // Mock: JWT sign throws error
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