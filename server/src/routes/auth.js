import express from 'express';
import * as authController from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Custom Authentication Routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/clerk-auth', authLimiter, authController.clerkAuth);
router.post('/logout', verifyToken, authController.logout);

// Clerk Hook (for webhook events)
router.post('/clerk-webhook', authController.clerkWebhook);

// Get Current User
router.get('/me', verifyToken, authController.getCurrentUser);

// Refresh Token
router.post('/refresh-token', authLimiter, authController.refreshToken);

// Password Management
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

export default router;
