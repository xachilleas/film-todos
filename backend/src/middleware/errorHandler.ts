import { Request, Response, NextFunction } from 'express';
import AppError from "../utils/AppError";

const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
)=> {
    console.error('Error: ', err);
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        message = err.message;
        statusCode = err.statusCode;
    }

    res.status(statusCode).json({
        status: 'error',
        message: message
    });
    };
export default errorHandler;
