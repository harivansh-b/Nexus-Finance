// Success Response
export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

// Error Response
export const errorResponse = (message, statusCode = 400, error = null) => {
  return {
    success: false,
    statusCode,
    message,
    ...(error && { error }),
  };
};

// Pagination Helper
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

// Validate Email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate JWT Token
import jwt from 'jsonwebtoken';

export const generateToken = (userId, clerkId = null, expiresIn = '7d') => {
  return jwt.sign(
    { userId, clerkId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Calculate percentage change
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

// Format currency
export const formatCurrency = (value, decimals = 2) => {
  return parseFloat(value).toFixed(decimals);
};
