import Razorpay from 'razorpay';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { successResponse, getExchangeRate } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendPaymentConfirmation } from './emailController.js';
import crypto from 'crypto';

let razorpayInstance = null;

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

// Get current exchange rate
export const getExchangeRateController = async (req, res, next) => {
  try {
    const rate = await getExchangeRate();
    res.json(successResponse({ rate }));
  } catch (error) {
    next(error);
  }
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
      const exchangeRate = await getExchangeRate();
      return res.status(201).json(
        successResponse(
          {
            orderId: `mock_order_${Date.now()}`,
            amount: parseFloat(amount),
            currency: 'INR',
            key: 'MOCK_KEY',
            isMock: true,
            exchangeRate
          },
          'Simulated order created',
          201
        )
      );
    }

    // REAL RAZORPAY FLOW
    const exchangeRate = await getExchangeRate();
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
          exchangeRate
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
    
    console.log('Payment Verification Started:', { razorpay_order_id, razorpay_payment_id, isMock, userId });

    if (!userId) {
      throw new AppError('Unauthorized: User ID missing', 401);
    }

    const razorpay = getRazorpayClient();
    let amountValue = 0;

    if (isMock || !razorpay) {
      console.log('Using Mock Verification');
      amountValue = parseFloat(req.body.amount || 0);
    } else {
      // REAL VERIFICATION
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      console.log('Signature Check:', { expected: expectedSignature, received: razorpay_signature });

      if (expectedSignature !== razorpay_signature) {
        console.error('Signature Mismatch');
        throw new AppError('Payment verification failed: Signature mismatch', 400);
      }

      console.log('Fetching payment from Razorpay...');
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      console.log('Payment Status:', payment.status);

      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        throw new AppError(`Payment not captured. Status: ${payment.status}`, 400);
      }
      amountValue = payment.amount / 100;
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Convert INR to USD
    console.log('Fetching exchange rate...');
    const exchangeRate = await getExchangeRate();
    const amountUSD = amountValue * exchangeRate;
    console.log('Conversion:', { amountValue, exchangeRate, amountUSD });

    const balanceBefore = user.balance;
    user.balance += amountUSD;
    await user.save();

    const transaction = new Transaction({
      userId,
      type: 'DEPOSIT',
      amount: amountUSD,
      price: 1,
      totalValue: amountUSD,
      status: 'COMPLETED',
      balanceBefore,
      balanceAfter: user.balance,
      description: isMock ? `Simulated Deposit ($${amountUSD.toFixed(2)})` : `Razorpay Deposit ($${amountUSD.toFixed(2)})`,
      notes: `Exchange rate: 1 INR = ${exchangeRate} USD`,
    });
    
    await transaction.save();

    // Send payment confirmation email
    sendPaymentConfirmation(user, amountUSD).catch(err => console.error('Payment email failed:', err));

    res.json(
      successResponse(
        {
          success: true,
          amountUSD,
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
