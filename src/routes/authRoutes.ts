import express from 'express';
import { register, login } from '../controllers/authController';
import { body } from 'express-validator';

const router = express.Router();

// **Rotte di autenticazione**
router.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register);

router.post('/login', login);

export default router;
