/**
 * Validation Middleware
 * Provides Zod schema validation for different parts of the request.
 * Supports validation of body, query parameters, URL parameters, or combinations.
 *
 * @module validate
 * @requires zod
 * @requires express
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Format Zod validation errors into a user-friendly structure
 *
 * @param {ZodError} error - The Zod validation error object
 * @returns {Array<{field: string, message: string}>} Array of field-specific error messages
 *
 * @example
 * // Returns: [{ field: 'body.email', message: 'Invalid email format' }]
 */
const formatZodErrors = (error: ZodError) => {
    return error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
    }));
};

/**
 * Sends a standardized validation error response
 *
 * @param {Response} res - Express response object
 * @param {ZodError} error - The Zod validation error
 * @returns {void} - Sends 400 response with validation errors
 */
const sendValidationError = (res: Response, error: ZodError): void => {
    const errors = formatZodErrors(error);

    res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors
    });
};

/**
 * Validates entire request object (body, query, and params combined)
 * Useful for complex endpoints that need all request parts validated
 *
 * @param {ZodSchema} schema - Zod schema that validates { body, query, params }
 * @returns {Function} Express middleware function
 *
 * @example
 * // Schema that validates all request parts
 * const schema = z.object({
 *   body: z.object({ email: z.string().email() }),
 *   params: z.object({ id: z.string().uuid() })
 * });
 * app.post('/api/users/:id', validate(schema), handler);
 */
export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                sendValidationError(res, error);
                return;
            }
            next(error);
        }
    };
};

/**
 * Validates only request body
 * Most commonly used for POST, PUT, PATCH requests
 *
 * @param {ZodSchema} schema - Zod schema that validates req.body
 * @returns {Function} Express middleware function
 *
 * @example
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(6)
 * });
 * app.post('/api/auth/register', validateBody(schema), handler);
 */
export const validateBody = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                sendValidationError(res, error);
                return;
            }
            next(error);
        }
    };
};

/**
 * Validates only query parameters
 * Used for GET requests with search/filter/pagination parameters
 *
 * @param {ZodSchema} schema - Zod schema that validates req.query
 * @returns {Function} Express middleware function
 *
 * @example
 * const schema = z.object({
 *   page: z.string().transform(Number).optional(),
 *   limit: z.string().transform(Number).optional()
 * });
 * app.get('/api/movies', validateQuery(schema), handler);
 */
export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                sendValidationError(res, error);
                return;
            }
            next(error);
        }
    };
};

/**
 * Validates only URL parameters
 * Used for routes with dynamic segments like /api/users/:id
 *
 * @param {ZodSchema} schema - Zod schema that validates req.params
 * @returns {Function} Express middleware function
 *
 * @example
 * const schema = z.object({
 *   id: z.string().regex(/^\d+$/)
 * });
 * app.get('/api/movies/:id', validateParams(schema), handler);
 */
export const validateParams = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                sendValidationError(res, error);
                return;
            }
            next(error);
        }
    };
};