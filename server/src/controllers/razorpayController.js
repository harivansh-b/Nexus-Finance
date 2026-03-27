import Razorpay from 'razorpay';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { successResponse } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';
import { Resend } from 'resend';
import crypto from 'crypto';

let razorpayInstance = null;
let resendInstance = null;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const getRazorpayClient = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  // Check if we are in mock mode
  if (RAZORPAY_KEY_ID === 'MOCK' || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return null;
  }

  try {
    if (razorpayInstance) return razorpayInstance;
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    return razorpayInstance;
  } catch (err) {
    console.error('Razorpay initialization failed:', err);
    return null;
  }
};

const getResendClient = () => {
  if (resendInstance) return resendInstance;
  if (!process.env.RESEND_API_KEY) return null;
  resendInstance = new Resend(process.env.RESEND_API_KEY);
  return resendInstance;
};

// Create Razorpay Order
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new AppError('Unauthorized: User ID missing', 401);
    }

    if (!amount || isNaN(amount) || amount < 1) {
      throw new AppError('Please enter a valid amount (minimum ₹1)', 400);
    }

    const razorpay = getRazorpayClient();

    // SIMULATED FLOW
    if (!razorpay) {
      return res.status(201).json(
        successResponse(
          {
            orderId: `mock_order_${Date.now()}`,
            amount: parseFloat(amount),
            currency: 'INR',
            key: 'MOCK_KEY',
            isMock: true,
          },
          'Simulated order created',
          201
        )
      );
    }

    // REAL RAZORPAY FLOW
    // Note: Receipt must be less than 40 chars
    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`, 
      notes: {
        userId: userId.toString(),
      },
    });

    res.status(201).json(
      successResponse(
        {
          orderId: order.id,
          amount: order.amount / 100,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
          isMock: false,
        },
        'Razorpay order created',
        201
      )
    );
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    next(error);
  }
};

// Verify Payment
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new AppError('Unauthorized: User ID missing', 401);
    }

    const razorpay = getRazorpayClient();
    let amountValue = 0;

    if (isMock || !razorpay) {
      amountValue = parseFloat(req.body.amount || 0);
    } else {
      // REAL VERIFICATION
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        throw new AppError('Payment verification failed', 400);
      }

      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured') {
        throw new AppError('Payment not captured', 400);
      }
      amountValue = payment.amount / 100;
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const balanceBefore = user.balance;
    user.balance += amountValue;
    await user.save();

    const transaction = new Transaction({
      userId,
      type: 'DEPOSIT',
      amount: amountValue,
      price: 1,
      totalValue: amountValue,
      status: 'COMPLETED',
      balanceBefore,
      balanceAfter: user.balance,
      description: isMock ? `Simulated Deposit` : `Razorpay Deposit`,
    });
    
    await transaction.save();

    res.json(
      successResponse(
        {
          success: true,
          newBalance: user.balance,
          transaction,
        },
        'Deposit successful'
      )
    );
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    next(error);
  }
};

// Get Payment History
export const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId, type: 'DEPOSIT' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ userId, type: 'DEPOSIT' });

    res.json(successResponse({ transactions, total }));
  } catch (error) {
    next(error);
  }
};
