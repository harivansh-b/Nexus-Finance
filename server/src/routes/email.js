import express from 'express';
import * as emailController from '../controllers/emailController.js';
import { verifyToken } from '../middleware/auth.js';
import { emailLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Send welcome email
router.post('/send-welcome', emailLimiter, emailController.sendWelcomeEmail);

// Send transaction email (authenticated)
router.post('/send-transaction', verifyToken, emailLimiter, emailController.sendTransactionEmail);

// Send payment confirmation email
router.post('/send-payment-confirmation', verifyToken, emailLimiter, emailController.sendPaymentConfirmation);

// Send login alert email
router.post('/send-login-alert', emailLimiter, emailController.sendLoginAlert);

export default router;
