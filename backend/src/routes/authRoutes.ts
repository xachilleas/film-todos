// backend/src/routes/authRoutes.ts

import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/schemas';

const router = express.Router();
const authController = new AuthController();

/**
* @swagger
* /api/auth/register:
*   post:
    *     summary: Register a new user
*     description: Creates a new user account with username, email, and password
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
    *             type: object
*             required:
*               - username
*               - email
*               - password
*             properties:
*               username:
    *                 type: string
*                 minLength: 3
*                 maxLength: 50
*                 pattern: "^[a-zA-Z0-9_]+$"
*                 example: "john_doe"
*               email:
*                 type: string
*                 format: email
*                 example: "john@example.com"
*               password:
*                 type: string
*                 minLength: 6
*                 example: "securePassword123"
*     responses:
*       201:
*         description: User registered successfully
*         content:
*           application/json:
*             schema:
    *               type: object
*               properties:
*                 status:
    *                   type: string
*                   example: "success"
*                 message:
*                   type: string
*                   example: "User registered successfully"
*                 data:
*                   type: object
*                   properties:
*                     token:
    *                       type: string
*                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
*                     user:
*                       type: object
*                       properties:
*                         id:
    *                           type: integer
*                           example: 1
*                         username:
*                           type: string
*                           example: "john_doe"
*                         email:
*                           type: string
*                           example: "john@example.com"
*       400:
*         description: Validation error or email already registered
*         content:
*           application/json:
*             schema:
    *               type: object
*               properties:
*                 status:
    *                   type: string
*                   example: "error"
*                 message:
*                   type: string
*                   example: "Validation failed"
*                 errors:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       field:
    *                         type: string
*                       message:
*                         type: string
*/
// POST /api/auth/register - Register a new user
router.post(
    '/register',
    validateBody(registerSchema),
    authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user and returns a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: "john_doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 */
// POST /api/auth/login - Login user
router.post(
    '/login',
    validateBody(loginSchema),
    authController.login
);

export default router;