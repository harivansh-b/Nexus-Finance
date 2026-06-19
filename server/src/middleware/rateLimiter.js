import rateLimit from 'express-rate-limit';

const minutes = (value) => value * 60 * 1000;

const createLimiter = ({ windowMinutes, max, message, skip }) =>
  rateLimit({
    windowMs: minutes(windowMinutes),
    max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip,
    message: {
      error: message,
    },
  });

export const apiLimiter = createLimiter({
  windowMinutes: 15,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 300,
  skip: (req) => req.path.startsWith('/crypto'),
  message: 'Too many requests. Please try again later.',
});

export const cryptoLimiter = createLimiter({
  windowMinutes: 15,
  max: Number(process.env.CRYPTO_RATE_LIMIT_MAX) || 1000,
  message: 'Too many crypto data requests. Please try again later.',
});

export const authLimiter = createLimiter({
  windowMinutes: 15,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: 'Too many authentication attempts. Please try again later.',
});

export const passwordResetLimiter = createLimiter({
  windowMinutes: 60,
  max: Number(process.env.PASSWORD_RESET_RATE_LIMIT_MAX) || 5,
  message: 'Too many password reset attempts. Please try again later.',
});

export const chatLimiter = createLimiter({
  windowMinutes: 15,
  max: Number(process.env.CHAT_RATE_LIMIT_MAX) || 30,
  message: 'Too many chat requests. Please slow down and try again later.',
});

export const emailLimiter = createLimiter({
  windowMinutes: 60,
  max: Number(process.env.EMAIL_RATE_LIMIT_MAX) || 20,
  message: 'Too many email requests. Please try again later.',
});

export const paymentLimiter = createLimiter({
  windowMinutes: 15,
  max: Number(process.env.PAYMENT_RATE_LIMIT_MAX) || 30,
  message: 'Too many payment requests. Please try again later.',
});

export const tradeLimiter = createLimiter({
  windowMinutes: 15,
  max: Number(process.env.TRADE_RATE_LIMIT_MAX) || 60,
  message: 'Too many trading requests. Please try again later.',
});
