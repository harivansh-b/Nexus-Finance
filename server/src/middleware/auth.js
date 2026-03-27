import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

// Verify JWT Token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

// Verify Clerk Token (optional, for Clerk auth)
export const verifyClerkToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    // Clerk token verification would go here
    // For now, we'll pass through - implement with @clerk/express in production
    next();
  } catch (error) {
    next(new AppError('Invalid Clerk token', 401));
  }
};

// Optional Auth - Try both JWT and Clerk
export const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token verification failed, but auth is optional
      console.warn('Token verification failed but auth is optional');
    }
  }

  next();
};
