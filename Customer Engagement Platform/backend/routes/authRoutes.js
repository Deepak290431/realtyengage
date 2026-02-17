const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const {
  generateToken,
  generateRefreshToken,
  authenticateToken,
  verifyRefreshToken,
  authRateLimiter
} = require('../middleware/auth');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
    console.error('Validation errors:', errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      message: errorMessages,
      errors: errors.array()
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().trim().escape(),
    body('lastName').notEmpty().trim().escape(),
    body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Invalid phone number')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, role = 'user' } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: 'Registration failed',
          message: 'Email already registered'
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: role === 'admin' && process.env.ALLOW_ADMIN_REGISTRATION === 'true' ? 'admin' : 'user'
      });

      await user.save();

      // Generate tokens
      const token = generateToken(user._id, user.role, user.tokenVersion);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: 'Unable to create account'
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid credentials'
        });
      }

      // Update last login
      user.lastLogin = new Date();

      // Parse User Agent for login history
      const ua = req.headers['user-agent'] || '';
      let device = 'Web Browser';
      let browser = 'Unknown Browser';
      let os = 'Unknown OS';

      if (ua.includes('Windows')) {
        os = 'Windows';
        device = 'Windows PC';
      } else if (ua.includes('Macintosh')) {
        os = 'macOS';
        device = 'MacBook/iMac';
      } else if (ua.includes('Android')) {
        os = 'Android';
        device = 'Android Phone';
      } else if (ua.includes('iPhone')) {
        os = 'iOS';
        device = 'iPhone';
      }

      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';

      const newHistory = {
        device,
        browser,
        os,
        ip: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
        location: 'Tamil Nadu, India', // Simplified for demo, in prod use geo-ip
        lastActive: new Date(),
        userAgent: ua
      };

      // Add to history and keep only last 5
      user.loginHistory = [newHistory, ...(user.loginHistory || [])].slice(0, 5);

      // Generate tokens
      const token = generateToken(user._id, user.role, user.tokenVersion);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          statusType: user.statusType
        },
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: 'Unable to authenticate'
      });
    }
  }
);

// @route   POST /api/auth/google
// @desc    Google Login
// @access  Public
router.post('/google',
  authRateLimiter,
  async (req, res) => {
    try {
      const { credential } = req.body;
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: profilePicture } = payload;

      console.log(`[GOOGLE LOGIN] Attempt for email: ${email}, GoogleID: ${googleId}`);

      let user = await User.findOne({ email });

      if (user) {
        // Requirement 1: If role === "admin", reject login attempt
        if (user.role === 'admin') {
          console.warn(`[GOOGLE LOGIN] Blocked: Admin account ${email} tried to login via Google`);
          return res.status(401).json({
            error: 'Access blocked',
            message: 'Admin accounts cannot login using Google. Please login using email and password.'
          });
        }

        // Update googleId if not present (linked account)
        if (!user.googleId) {
          user.googleId = googleId;
          if (!user.profilePicture) user.profilePicture = profilePicture;
          await user.save();
        }
      } else {
        // Create new user with role = "user" and authProvider = "google"
        user = new User({
          email,
          googleId,
          firstName: firstName || 'Google',
          lastName: lastName || 'User',
          profilePicture,
          role: 'user',
          authProvider: 'google',
          isVerified: true
        });
        await user.save();
      }

      // Generate tokens
      const token = generateToken(user._id, user.role, user.tokenVersion);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Google login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          statusType: user.statusType,
          profilePicture: user.profilePicture
        },
        token,
        refreshToken
      });
      console.log(`[GOOGLE LOGIN] Success: ${email} logged in as ${user.role}`);
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).json({
        error: 'Google login failed',
        message: error.message || 'Unable to authenticate with Google'
      });
    }
  }
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh',
  [body('refreshToken').notEmpty()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { refreshToken } = req.body;

      const user = await verifyRefreshToken(refreshToken);

      // Generate new tokens
      const newToken = generateToken(user._id, user.role, user.tokenVersion);
      const newRefreshToken = generateRefreshToken(user._id);

      // Save new refresh token
      user.refreshToken = newRefreshToken;
      await user.save();

      res.json({
        success: true,
        token: newToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        error: 'Token refresh failed',
        message: 'Invalid refresh token'
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Clear refresh token
    const user = await User.findById(req.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Unable to logout'
    });
  }
});

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      // Increment token version to invalidate all current JWTs
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      // Clear refresh token
      user.refreshToken = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Unable to logout from all devices'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'Unable to retrieve user data'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  authenticateToken,
  [
    body('firstName').optional().trim().escape(),
    body('lastName').optional().trim().escape(),
    body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/),
    body('address.street').optional({ checkFalsy: true }).trim().escape(),
    body('address.city').optional({ checkFalsy: true }).trim().escape(),
    body('address.state').optional({ checkFalsy: true }).trim().escape(),
    body('address.pincode').optional({ checkFalsy: true }).matches(/^[0-9]{6}$/),
    body('preferences.theme').optional({ checkFalsy: true }).isIn(['light', 'dark']),
    body('preferences.notifications').optional({ checkFalsy: true }).isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updates = req.body;

      // Remove fields that shouldn't be updated through this route
      delete updates.email;
      delete updates.password;
      delete updates.role;
      delete updates.statusType;
      delete updates.isVerified;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password -refreshToken');

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        error: 'Update failed',
        message: 'Unable to update profile'
      });
    }
  }
);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId).select('+password');

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Password change failed',
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        error: 'Password change failed',
        message: 'Unable to change password'
      });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password',
  authRateLimiter,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().matches(/^[0-9]{10}$/)
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, phone } = req.body;

      if (!email && !phone) {
        return res.status(400).json({
          error: 'Request failed',
          message: 'Please provide either email or phone number'
        });
      }

      const query = email ? { email } : { phone };
      const user = await User.findOne(query);

      if (!user) {
        const isDev = (process.env.NODE_ENV || '').trim().toLowerCase() === 'development';
        return res.json({
          success: true,
          message: isDev ? `USER NOT FOUND: The provided ${email ? 'email' : 'mobile number'} does not exist in the database.` : `If the ${email ? 'email' : 'mobile number'} exists, an OTP has been sent`
        });
      }

      // Generate reset token (OTP)
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      if (email) {
        // Send email with OTP
        const sendEmail = require('../utils/emailService');
        try {
          await sendEmail({
            to: user.email,
            subject: 'Your Password Reset OTP - RealtyEngage',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #0B1F33; text-align: center;">Verify Your Identity</h2>
                <p style="font-size: 16px; color: #555;">Hi ${user.firstName},</p>
                <p style="font-size: 16px; color: #555;">You requested a password reset. Please use the following 6-digit OTP to proceed:</p>
                <div style="background-color: #f4f7f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #C9A24D;">${resetToken}</span>
                </div>
                <p style="font-size: 14px; color: #888; text-align: center;">This code will expire in 10 minutes.</p>
                <p style="font-size: 16px; color: #555;">If you didn't request this, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #aaa; text-align: center;">© 2026 RealtyEngage. All rights reserved.</p>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Failed to send OTP email:', emailError);
        }
      } else if (phone) {
        // Integrate SMS Service
        const sendSMS = require('../utils/smsService');
        try {
          await sendSMS({
            to: phone,
            message: `Your RealtyEngage password reset code is ${resetToken}. Valid for 10 mins.`
          });
        } catch (smsError) {
          console.error('Failed to send OTP SMS:', smsError);
        }
      }

      const nodeEnv = (process.env.NODE_ENV || '').trim().toLowerCase();
      const isDev = nodeEnv === 'development' || nodeEnv === 'dev' || !nodeEnv;
      const noSmsConfig = !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN;
      const noEmailConfig = !process.env.SENDGRID_API_KEY && !process.env.EMAIL_PASSWORD;

      // Always return token in development for easier testing
      const showToken = isDev || noSmsConfig || noEmailConfig;

      console.log(`[Forgot Password] Method: ${email ? 'email' : 'phone'}, User: ${email || phone}, Mode: ${nodeEnv}, ShowToken: ${showToken}`);

      res.json({
        success: true,
        message: `OTP sent to your ${email ? 'email address' : 'mobile number'}`,
        resetToken: showToken ? resetToken : undefined
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        error: 'Request failed',
        message: 'Unable to process password reset request'
      });
    }
  }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify reset OTP
// @access  Public
router.post('/verify-otp',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().matches(/^[0-9]{10}$/),
    body('otp').notEmpty()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, phone, otp } = req.body;

      if (!email && !phone) {
        return res.status(400).json({
          error: 'Verification failed',
          message: 'Please provide either email or phone number'
        });
      }

      const hashedToken = require('crypto')
        .createHash('sha256')
        .update(otp)
        .digest('hex');

      const query = {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      };

      if (email) query.email = email;
      if (phone) query.phone = phone;

      const user = await User.findOne(query);

      if (!user) {
        return res.status(400).json({
          error: 'Verification failed',
          message: 'Invalid or expired OTP'
        });
      }

      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
        error: 'Verification failed',
        message: 'Unable to verify OTP'
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      const hashedToken = require('crypto')
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          error: 'Reset failed',
          message: 'Invalid or expired reset token'
        });
      }

      // Update password and invalidate all current sessions
      user.password = newPassword;
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      user.refreshToken = undefined;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        error: 'Reset failed',
        message: 'Unable to reset password'
      });
    }
  }
);

module.exports = router;
