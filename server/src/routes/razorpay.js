import express from 'express';
import * as razorpayController from '../controllers/razorpayController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create order (authenticated)
router.post('/create-order', verifyToken, razorpayController.createRazorpayOrder);

// Verify payment (authenticated)
router.post('/verify-payment', verifyToken, razorpayController.verifyPayment);

// Get payment history
router.get('/payments', verifyToken, razorpayController.getPaymentHistory);

export default router;
