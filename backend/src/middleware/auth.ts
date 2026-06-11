import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    // ADD THIS CHECK - ensures token exists
    if (!token) {
        res.status(401).json({ message: 'Access denied. Token missing.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            req.userId = (decoded as any).userId;
            next();
        } else {
            res.status(401).json({ message: 'Invalid token structure' });
            return;
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
};