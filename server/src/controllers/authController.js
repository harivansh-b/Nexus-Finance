import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

import {
  generateToken,
  isValidEmail,
  successResponse
} from '../utils/helpers.js';

import { AppError } from '../middleware/errorHandler.js';

// ✅ EMAILS
import {
  sendWelcomeEmail,
  sendLoginAlert
} from './emailController.js';

// -------------------------------
// REGISTER (CUSTOM AUTH)
// -------------------------------
export const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    if (!isValidEmail(email)) {
      throw new AppError('Invalid email format', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      username: username || email.split('@')[0],
      authMethod: 'custom',
      balance: 10000,
    });

    await user.save();

    // ✅ Welcome Email
    sendWelcomeEmail(user).catch(err =>
      console.error('Welcome email failed:', err)
    );

    const token = generateToken(user._id);

    res.status(201).json(
      successResponse(
        { user: user.toJSON(), token },
        'User registered successfully',
        201
      )
    );
  } catch (error) {
    next(error);
  }
};

// -------------------------------
// LOGIN (CUSTOM AUTH)
// -------------------------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.password) {
      throw new AppError('Use Clerk login for this account', 400);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // ✅ LOGIN ALERT
    const context = {
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
      device: req.headers['user-agent'] || 'Unknown'
    };

    sendLoginAlert(user, context).catch(err =>
      console.error('Login alert failed:', err)
    );

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json(
      successResponse(
        { user: user.toJSON(), token },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

// -------------------------------
// CLERK AUTH (REGISTER + LOGIN)
// -------------------------------
export const clerkAuth = async (req, res, next) => {
  try {
    const { clerkId, email, username, profileImage } = req.body;

    if (!clerkId || !email) {
      throw new AppError('Clerk ID and email are required', 400);
    }

    let user = await User.findOne({
      $or: [{ clerkId }, { email: email.toLowerCase() }],
    });

    let isNewUser = false;

    // -------------------------------
    // REGISTER (FIRST TIME CLERK)
    // -------------------------------
    if (!user) {
      isNewUser = true;

      user = new User({
        clerkId,
        email: email.toLowerCase(),
        username: username || email.split('@')[0],
        profileImage,
        authMethod: 'clerk',
        verified: true,
        balance: 10000,
      });

      await user.save();

      // ✅ Welcome Email
      sendWelcomeEmail(user).catch(err =>
        console.error('Clerk welcome email failed:', err)
      );
    } 
    // -------------------------------
    // LOGIN (EXISTING USER)
    // -------------------------------
    else {
      user.clerkId = clerkId;
      user.email = email.toLowerCase();
      user.username = username || user.username;
      user.profileImage = profileImage || user.profileImage;
      user.authMethod = 'clerk';
      user.verified = true;

      await user.save();
    }

    // -------------------------------
    // LOGIN ALERT (FOR BOTH)
    // -------------------------------
    const context = {
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
      device: req.headers['user-agent'] || 'Unknown',
    };

    sendLoginAlert(user, context).catch(err =>
      console.error('Clerk login alert failed:', err)
    );

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, clerkId);

    res.json(
      successResponse(
        {
          user: user.toJSON(),
          token,
          isNewUser,
        },
        isNewUser
          ? 'Clerk registration successful'
          : 'Clerk login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

// -------------------------------
// LOGOUT
// -------------------------------
export const logout = async (req, res, next) => {
  try {
    res.json(successResponse(null, 'Logout successful'));
  } catch (error) {
    next(error);
  }
};

// -------------------------------
// GET CURRENT USER
// -------------------------------
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(successResponse(user.toJSON(), 'User fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Clerk Webhook Handler
export const clerkWebhook = async (req, res, next) => {
  try {
    const { type, data } = req.body;

    if (type === 'user.created') {
      const { id, email_addresses, primary_email_address_id } = data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === primary_email_address_id
      )?.email_address;

      // Check if user already exists
      let user = await User.findOne({ clerkId: id });
      if (!user) {
        user = new User({
          clerkId: id,
          email: primaryEmail,
          authMethod: 'clerk',
          balance: 10000,
          verified: true,
        });
        await user.save();
      }
    }

    if (type === 'user.deleted') {
      await User.findOneAndDelete({ clerkId: data.id });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    // In production, validate the old token and issue a new one
    // This is a simplified implementation
    res.json(successResponse({ token: generateToken(req.user?.userId) }, 'Token refreshed'));
  } catch (error) {
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json(successResponse(null, 'If email exists, password reset link will be sent'));
    }

    // TODO: Generate reset token and send email
    res.json(successResponse(null, 'Password reset link sent to email'));
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // TODO: Verify token and update password
    res.json(successResponse(null, 'Password reset successfully'));
  } catch (error) {
    next(error);
  }
};
