import nodemailer from 'nodemailer';
import { AppError } from '../middleware/errorHandler.js';

let transporter = null;

// -------------------------------
// SMTP TRANSPORTER
// -------------------------------
const getTransporter = () => {
    if (transporter) return transporter;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.warn('SMTP is not fully configured. Emails will not be sent.');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT) || 587,
        secure: SMTP_SECURE === 'true',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    return transporter;
};

const FROM_EMAIL = process.env.SMTP_FROM || 'no-reply@nexus-finance.com';

// -------------------------------
// EMAIL UI WRAPPER (🔥 MAIN UPGRADE)
// -------------------------------
const emailWrapper = (content) => `
<div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        
        <table width="600" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:20px;text-align:center;">
              <h2 style="margin:0;">Nexus Finance</h2>
              <p style="margin:5px 0 0;font-size:14px;color:#cbd5f5;">Your Gateway to Crypto Trading</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9;text-align:center;padding:15px;font-size:12px;color:#64748b;">
              © ${new Date().getFullYear()} Nexus Finance. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</div>
`;

// -------------------------------
// GENERIC EMAIL FUNCTION
// -------------------------------
const sendEmail = async ({ to, subject, html }) => {
    const mailTransporter = getTransporter();
    if (!mailTransporter) return;

    try {
        const info = await mailTransporter.sendMail({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        console.log('Message sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email send failed:', error);
    }
};

// -------------------------------
// 1. WELCOME EMAIL
// -------------------------------
export const sendWelcomeEmail = async (user) => {
    const { email, username, balance } = user;

    await sendEmail({
        to: email,
        subject: 'Welcome to Nexus Finance!',
        html: emailWrapper(`
            <h2>Welcome, ${username || 'Trader'} 👋</h2>
            <p style="color:#475569;">Your account is ready. Start trading instantly.</p>

            <div style="background:#f8fafc;padding:15px;border-radius:8px;margin:20px 0;">
                <p><strong>Starting Balance:</strong> $${balance?.toLocaleString() || '10,000'}</p>
                <p><strong>Markets:</strong> 50+ Cryptocurrencies</p>
                <p><strong>Features:</strong> Real-time tracking, Portfolio analytics</p>
            </div>

            <div style="text-align:center;margin-top:25px;">
                <a href="${process.env.CLIENT_URL}/login"
                   style="background:#2563eb;color:#fff;padding:12px 25px;border-radius:6px;text-decoration:none;font-weight:bold;">
                   Start Trading
                </a>
            </div>
        `),
    });
};

// -------------------------------
// 2. TRANSACTION EMAIL
// -------------------------------
export const sendTransactionEmail = async (user, transaction) => {
    const { type, coin, amount, price, totalValue, createdAt } = transaction;

    await sendEmail({
        to: user.email,
        subject: `${type} Confirmation - ${coin?.symbol}`,
        html: emailWrapper(`
            <h2>${type} Order Confirmed</h2>

            <table width="100%" style="border-collapse:collapse;margin-top:15px;">
                <tr style="background:#f8fafc;">
                    <td style="padding:10px;"><strong>Crypto</strong></td>
                    <td style="padding:10px;">${coin?.name} (${coin?.symbol})</td>
                </tr>
                <tr>
                    <td style="padding:10px;"><strong>Amount</strong></td>
                    <td style="padding:10px;">${amount} ${coin?.symbol}</td>
                </tr>
                <tr style="background:#f8fafc;">
                    <td style="padding:10px;"><strong>Price</strong></td>
                    <td style="padding:10px;">$${price?.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="padding:10px;"><strong>Total</strong></td>
                    <td style="padding:10px;">$${totalValue?.toFixed(2)}</td>
                </tr>
                <tr style="background:#f8fafc;">
                    <td style="padding:10px;"><strong>Time</strong></td>
                    <td style="padding:10px;">${new Date(createdAt).toLocaleString()}</td>
                </tr>
            </table>

            <div style="text-align:center;margin-top:25px;">
                <a href="${process.env.CLIENT_URL}/portfolio"
                   style="background:#16a34a;color:white;padding:12px 25px;border-radius:6px;text-decoration:none;">
                   View Portfolio
                </a>
            </div>
        `),
    });
};

// -------------------------------
// 3. PAYMENT CONFIRMATION
// -------------------------------
export const sendPaymentConfirmation = async (user, amount) => {
    await sendEmail({
        to: user.email,
        subject: `Payment Confirmed - $${amount}`,
        html: emailWrapper(`
            <h2>Payment Successful ✅</h2>

            <div style="background:#ecfdf5;padding:15px;border-radius:8px;margin:20px 0;">
                <p><strong>Amount:</strong> $${amount}</p>
                <p><strong>New Balance:</strong> $${user.balance.toFixed(2)}</p>
            </div>

            <div style="text-align:center;">
                <a href="${process.env.CLIENT_URL}/dashboard"
                   style="background:#2563eb;color:white;padding:12px 25px;border-radius:6px;text-decoration:none;">
                   Go to Dashboard
                </a>
            </div>
        `),
    });
};

// -------------------------------
// 4. LOGIN ALERT
// -------------------------------
export const sendLoginAlert = async (user, context = {}) => {
    const { ipAddress, device } = context;

    await sendEmail({
        to: user.email,
        subject: 'Login Alert - New Access Detected',
        html: emailWrapper(`
            <h2 style="color:#dc2626;">⚠️ New Login Detected</h2>

            <div style="background:#fff1f2;padding:15px;border-radius:8px;margin:20px 0;">
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>IP:</strong> ${ipAddress || 'Unknown'}</p>
                <p><strong>Device:</strong> ${device || 'Unknown'}</p>
            </div>

            <p style="color:#475569;">If this wasn't you, secure your account immediately.</p>

            <div style="text-align:center;">
                <a href="${process.env.CLIENT_URL}/security"
                   style="background:#dc2626;color:white;padding:12px 25px;border-radius:6px;text-decoration:none;">
                   Secure Account
                </a>
            </div>
        `),
    });
};