import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {AuthenticatedRequest} from "../@types/requestTypes";

interface JwtPayload {
    userId: number;
    username: string;
}

export const authenticateJWT = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
        if (err) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        req.user = user as JwtPayload;
        next();
    });
};