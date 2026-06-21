// backend/src/middleware/validate.ts

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// For validating body, query, and params together
export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors
                });
                return;
            }
            next(error);
        }
    };
};

// For validating only body
export const validateBody = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors
                });
                return;
            }
            next(error);
        }
    };
};

// For validating only query params
export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors
                });
                return;
            }
            next(error);
        }
    };
};

// For validating only URL params
export const validateParams = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors
                });
                return;
            }
            next(error);
        }
    };
};