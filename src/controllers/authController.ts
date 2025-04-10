import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { User } from "@prisma/client";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in environment variables');
}
/*
/!**
 * @openapi
 * components:
 *   schemas:
 *     UserRegister:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: password123
 *     UserLogin:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: johndoe
 *         password:
 *           type: string
 *           format: password
 *           example: password123
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             email:
 *               type: string
 *!/

/!**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 *!/
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { username, email, password } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ username }, { email }] }
        });

        if (existingUser) {
            const conflictField = existingUser.username === username ? 'username' : 'email';
            res.status(409).json({ message: `User with this ${conflictField} already exists` });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await prisma.user.create({
            data: { username, email, password: hashedPassword },
            select: { id: true, username: true, email: true }
        });

        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: newUser
        });
    } catch (error) {
        next(error);
    }
};

/!**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *!/*/
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { username, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true, username: true, password: true, email: true }
        });

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // const token = jwt.sign(
        //     { userId: user.id, username: user.username },
        //     JWT_SECRET,
        //     { expiresIn: JWT_EXPIRATION }
        // );

        const { password: _, ...userData } = user;

        res.json({
            message: 'Login successful',
            //token,
            user: userData
        });
    } catch (error) {
        next(error);
    }
};
