import express from 'express';
import * as emailController from '../controllers/emailController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Send welcome email
router.post('/send-welcome', emailController.sendWelcomeEmail);

// Send transaction email (authenticated)
router.post('/send-transaction', verifyToken, emailController.sendTransactionEmail);

// Send payment confirmation email
router.post('/send-payment-confirmation', verifyToken, emailController.sendPaymentConfirmation);

// Send login alert email
router.post('/send-login-alert', emailController.sendLoginAlert);

export default router;
