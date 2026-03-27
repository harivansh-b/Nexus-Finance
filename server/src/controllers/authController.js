import User from '../models/User.js';
import { generateToken, isValidEmail, successResponse, errorResponse } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';
import Transaction from '../models/Transaction.js';

// Register (Custom Auth)
export const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    if (!isValidEmail(email)) {
      throw new AppError('Invalid email format', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('User already exists with this email', 409);
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      username: username || email.split('@')[0],
      authMethod: 'custom',
      balance: 10000,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json(
      successResponse(
        {
          user: user.toJSON(),
          token,
        },
        'User registered successfully',
        201
      )
    );
  } catch (error) {
    next(error);
  }
};

// Login (Custom Auth)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    if (!user.password) {
      throw new AppError('This account uses Clerk authentication', 400);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json(
      successResponse(
        {
          user: user.toJSON(),
          token,
        },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Clerk Auth Sync
export const clerkAuth = async (req, res, next) => {
  try {
    const { clerkId, email, username, profileImage } = req.body;

    if (!clerkId || !email) {
      throw new AppError('Clerk ID and email are required', 400);
    }

    let user = await User.findOne({
      $or: [{ clerkId }, { email: email.toLowerCase() }],
    });

    if (!user) {
      user = new User({
        clerkId,
        email: email.toLowerCase(),
        username: username || email.split('@')[0],
        profileImage,
        authMethod: 'clerk',
        verified: true,
      });
    } else {
      user.clerkId = clerkId;
      user.email = email.toLowerCase();
      user.username = username || user.username || email.split('@')[0];
      user.profileImage = profileImage || user.profileImage;
      user.authMethod = 'clerk';
      user.verified = true;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, clerkId);

    res.json(
      successResponse(
        {
          user: user.toJSON(),
          token,
        },
        'Clerk authentication successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    // Logout is primarily client-side (token deletion)
    res.json(successResponse(null, 'Logout successful'));
  } catch (error) {
    next(error);
  }
};

// Get Current User
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
