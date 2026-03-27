import Razorpay from 'razorpay';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { successResponse, AppError } from '../utils/helpers.js';
import { Resend } from 'resend';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY);

// Create Razorpay Order
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (!amount || amount < 1) {
      throw new AppError('Amount must be at least 1', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        email: user.email,
        username: user.username,
      },
    });

    res.json(
      successResponse(
        {
          orderId: order.id,
          amount: order.amount / 100,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
        },
        'Razorpay order created',
        201
      )
    );
  } catch (error) {
    next(error);
  }
};

// Verify Payment
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.userId;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new AppError('Payment verification failed', 400);
    }

    // Get payment details
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      throw new AppError('Payment not captured', 400);
    }

    const amount = payment.amount / 100; // Convert from paise to rupees

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update user balance
    const balanceBefore = user.balance;
    user.balance += amount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'DEPOSIT',
      amount,
      price: 1,
      totalValue: amount,
      status: 'COMPLETED',
      balanceBefore,
      balanceAfter: user.balance,
      description: `Payment via Razorpay (ID: ${razorpay_payment_id})`,
      relatedId: razorpay_payment_id,
    });
    await transaction.save();

    // Send confirmation email
    await resend.emails.send({
      from: 'noreply@nexus-finance.com',
      to: user.email,
      subject: 'Payment Confirmation - Nexus Finance',
      html: `
        <h2>Payment Confirmed ✅</h2>
        <p>Thank you for your deposit!</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
        <p><strong>New Balance:</strong> ₹${user.balance.toFixed(2)}</p>
        <p>Your funds are now available for trading immediately.</p>
        <p><a href="${process.env.CLIENT_URL}/dashboard">Start trading now</a></p>
      `,
    });

    res.json(
      successResponse(
        {
          success: true,
          newBalance: user.balance,
          transaction,
        },
        'Payment verified successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get Payment History
export const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      userId,
      type: 'DEPOSIT',
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({
      userId,
      type: 'DEPOSIT',
    });

    res.json(
      successResponse(
        {
          transactions,
          pagination: { page: parseInt(page), limit: parseInt(limit), total },
        },
        'Payment history fetched'
      )
    );
  } catch (error) {
    next(error);
  }
};
