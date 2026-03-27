import express from 'express';
import * as stripeController from '../controllers/stripeController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create checkout session (authenticated)
router.post('/create-checkout-session', verifyToken, stripeController.createCheckoutSession);

// Webhook (no auth needed - uses Stripe signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Get payment history
router.get('/payments', verifyToken, stripeController.getPaymentHistory);

export default router;
