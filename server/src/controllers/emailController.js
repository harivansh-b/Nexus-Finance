import { Resend } from 'resend';
import { successResponse } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';
import User from '../models/User.js';

let resendInstance = null;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const getResendClient = () => {
  if (resendInstance) return resendInstance;

  if (!process.env.RESEND_API_KEY) {
    throw new AppError('Resend is not configured on the server', 500);
  }

  resendInstance = new Resend(process.env.RESEND_API_KEY);
  return resendInstance;
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nexus-finance.com';

// Send Welcome Email
export const sendWelcomeEmail = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    const resend = getResendClient();

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'Welcome to Nexus Finance!',
      html: `
        <h2>Welcome to Nexus Finance, ${name || 'Trader'}!</h2>
        <p>We're excited to have you on board.</p>
        <p><strong>Your account is ready to use!</strong></p>
        <ul>
          <li>Starting Balance: $10,000</li>
          <li>Access to 50+ cryptocurrencies</li>
          <li>Real-time price updates</li>
          <li>Advanced portfolio tracking</li>
        </ul>
        <p><a href="${process.env.CLIENT_URL}/login">Log in to your account</a></p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr>
        <p><small>Nexus Finance - Your Gateway to Crypto Trading</small></p>
      `,
    });

    res.json(successResponse(null, 'Welcome email sent'));
  } catch (error) {
    next(error);
  }
};

// Send Transaction Email
export const sendTransactionEmail = async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user.userId;
    const resend = getResendClient();

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { type, coin, amount, price, totalValue, createdAt } = req.body;
    const subject = `${type === 'BUY' ? 'Buy' : 'Sell'} Confirmation - ${coin?.symbol}`;

    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: user.email,
      subject,
      html: `
        <h2>${type} Order Confirmation</h2>
        <p><strong>Order Details:</strong></p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Cryptocurrency:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${coin?.name} (${coin?.symbol})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${amount} ${coin?.symbol}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Price per Unit:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">$${price?.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Value:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">$${totalValue?.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(createdAt).toLocaleString()}</td>
          </tr>
        </table>
        <p><a href="${process.env.CLIENT_URL}/portfolio">View your portfolio</a></p>
        <hr>
        <p><small>This is an automated message. Do not reply to this email.</small></p>
      `,
    });

    res.json(successResponse(null, 'Transaction email sent'));
  } catch (error) {
    next(error);
  }
};

// Send Payment Confirmation Email
export const sendPaymentConfirmation = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;
    const resend = getResendClient();

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: user.email,
      subject: `Payment Confirmed - $${amount}`,
      html: `
        <h2>Payment Confirmed</h2>
        <p>Thank you for your deposit!</p>
        <p><strong>Amount Deposited:</strong> $${amount}</p>
        <p><strong>New Balance:</strong> $${user.balance.toFixed(2)}</p>
        <p>Your funds are now available for trading immediately.</p>
        <p><a href="${process.env.CLIENT_URL}/dashboard">Start trading now</a></p>
        <hr>
        <p><small>Nexus Finance - Your Gateway to Crypto Trading</small></p>
      `,
    });

    res.json(successResponse(null, 'Payment confirmation email sent'));
  } catch (error) {
    next(error);
  }
};

// Send Login Alert Email
export const sendLoginAlert = async (req, res, next) => {
  try {
    const { email, ipAddress, device } = req.body;
    const resend = getResendClient();

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'Login Alert - New Device Access',
      html: `
        <h2>New Login Detected</h2>
        <p>We detected a new login to your Nexus Finance account.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Time: ${new Date().toLocaleString()}</li>
          <li>IP Address: ${ipAddress || 'Unknown'}</li>
          <li>Device: ${device || 'Unknown'}</li>
        </ul>
        <p>If this wasn't you, please secure your account immediately by changing your password.</p>
        <p><a href="${process.env.CLIENT_URL}/security">View Security Settings</a></p>
        <hr>
        <p><small>Nexus Finance Security Alert</small></p>
      `,
    });

    res.json(successResponse(null, 'Login alert email sent'));
  } catch (error) {
    next(error);
  }
};
