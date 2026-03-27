import Stripe from 'stripe';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { successResponse, AppError } from '../utils/helpers.js';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Create Checkout Session
export const createCheckoutSession = async (req, res, next) => {
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Nexus Finance Wallet Top-up',
              description: `Add $${amount} to your Nexus Finance account`,
              images: ['https://nexus-finance.com/logo.png'], // Update with actual logo URL
            },
            unit_amount: amount * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        amount,
      },
    });

    res.json(successResponse({ sessionId: session.id }, 'Checkout session created', 201));
  } catch (error) {
    next(error);
  }
};

// Handle Stripe Webhook
export const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new AppError(`Webhook error: ${err.message}`, 400);
    }

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await handleSuccessfulPayment(session);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Handle Successful Payment
const handleSuccessfulPayment = async (session) => {
  try {
    const { userId, amount } = session.metadata;

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for payment:', userId);
      return;
    }

    // Update user balance
    const balanceBefore = user.balance;
    user.balance += parseInt(amount);
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'DEPOSIT',
      amount: parseInt(amount),
      price: 1,
      totalValue: parseInt(amount),
      status: 'COMPLETED',
      balanceBefore,
      balanceAfter: user.balance,
      description: `Payment via Stripe (ID: ${session.id})`,
      relatedId: session.id,
    });
    await transaction.save();

    // Send confirmation email
    await resend.emails.send({
      from: 'noreply@nexus-finance.com',
      to: user.email,
      subject: 'Payment Confirmation - Nexus Finance',
      html: `
        <h2>Payment Confirmed</h2>
        <p>Thank you for your deposit!</p>
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>New Balance:</strong> $${user.balance.toFixed(2)}</p>
        <p>Your funds are now available for trading.</p>
      `,
    });

    console.log(`✅ Payment processed for user ${userId}: $${amount}`);
  } catch (error) {
    console.error('Error handling payment:', error);
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
