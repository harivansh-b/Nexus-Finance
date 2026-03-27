import express from 'express';
import * as authController from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Custom Authentication Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);

// Clerk Hook (for webhook events)
router.post('/clerk-webhook', authController.clerkWebhook);

// Get Current User
router.get('/me', verifyToken, authController.getCurrentUser);

// Refresh Token
router.post('/refresh-token', authController.refreshToken);

// Password Management
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
