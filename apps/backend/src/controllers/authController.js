const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} = require('../utils/jwt');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../utils/emailjs');
const logger = require('../config/logger');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ code: 'USER_EXISTS', message: 'Email already registered' });
    }

    // Create user (no email verification required)
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash: password,
      verified: true, // Auto-verify users
    });

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: 'Account created successfully! You can now login.',
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    // Skip email verification check - allow login without verification

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    logger.info(`User logged in: ${email}`);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const tokenDoc = await verifyRefreshToken(refreshToken);
    if (!tokenDoc) {
      return res.status(401).json({ code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' });
    }

    // Generate new tokens
    const accessToken = generateAccessToken(tokenDoc.userId);
    const newRefreshToken = await generateRefreshToken(tokenDoc.userId);

    // Revoke old refresh token
    await revokeRefreshToken(refreshToken, newRefreshToken);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ code: 'INVALID_TOKEN', message: 'Invalid verification token' });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);

    logger.info(`Email verified: ${user.email}`);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    console.log('\n🔐 === FORGOT PASSWORD REQUEST ===');
    const { email } = req.body;
    console.log('📧 Email received:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found with email:', email);
      // Don't reveal if user exists (security best practice)
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    console.log('✅ User found:', user.name);
    console.log('Generating reset token...');

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log('✅ Reset token saved to database');
    console.log('Token expires at:', new Date(user.resetPasswordExpires).toLocaleString());
    console.log('\n🚀 Attempting to send password reset email...');

    // Send reset email
    const emailResult = await sendPasswordResetEmail(user, resetToken);
    
    console.log('\n📊 Final email result:', emailResult);
    
    if (!emailResult || !emailResult.success) {
      console.log('⚠️ Email sending FAILED');
      logger.warn(`Failed to send password reset email to: ${email}`);
    } else {
      console.log('✅ Email sending SUCCESSFUL');
      logger.info(`Password reset email sent successfully to: ${email}`);
    }

    console.log('=== END FORGOT PASSWORD REQUEST ===\n');

    // Always return success message (security best practice)
    res.json({ 
      message: 'If the email exists, a reset link has been sent.',
      // In development, show if email was actually sent
      ...(process.env.NODE_ENV === 'development' && { emailSent: emailResult?.success })
    });
  } catch (error) {
    console.error('💥 Error in forgotPassword:', error);
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' });
    }

    user.passwordHash = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Revoke all existing refresh tokens
    await revokeAllUserTokens(user._id);

    logger.info(`Password reset: ${user.email}`);

    res.json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatarUrl } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};


exports.validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token'
      });
    }

    res.json({ message: 'Reset token is valid' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token'
      });
    }

    // Update password (bypass pre-save hook by using updateOne)
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.updateOne(
      { _id: user._id },
      {
        passwordHash: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      }
    );

    logger.info(`Password reset successful for: ${user.email}`);

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

