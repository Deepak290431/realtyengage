const express = require('express');
const router = express.Router();
const { param, body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { role, statusType, page = 1, limit = 10, sort = '-createdAt' } = req.query;

      // Build filter
      let filter = {};
      if (role) filter.role = role;
      if (statusType) filter.statusType = statusType;

      // Build sort
      let sortObj = {};
      if (sort.startsWith('-')) {
        sortObj[sort.substring(1)] = -1;
      } else {
        sortObj[sort] = 1;
      }

      // Execute query with pagination
      const users = await User.find(filter)
        .select('-password -refreshToken')
        .sort(sortObj)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalCount = await User.countDocuments(filter);

      res.json({
        success: true,
        data: users,
        pagination: {
          total: totalCount,
          page: Number(page),
          pages: Math.ceil(totalCount / limit),
          limit: Number(limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        error: 'Failed to fetch users'
      });
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin or Self)
router.get('/:id',
  authenticateToken,
  [param('id').isMongoId()],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Check if user is admin or accessing own profile
      if (req.user.role !== 'admin' && req.params.id !== req.userId.toString()) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      const user = await User.findById(req.params.id)
        .select('-password -refreshToken');

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Failed to fetch user'
      });
    }
  }
);

// @route   POST /api/users
// @desc    Create a new user (Admin only)
// @access  Private (Admin)
router.post('/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().trim().escape().withMessage('First name is required'),
    body('lastName').notEmpty().trim().escape().withMessage('Last name is required'),
    body('role').isIn(['admin', 'customer', 'user', 'super_admin']).withMessage('Invalid role'),
    body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, role } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: 'Creation failed',
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
        role,
        isVerified: true // Staff created by admin are auto-verified
      });

      // Role permission check: Only super_admin can create admin accounts
      if ((role === 'admin' || role === 'super_admin') && req.user.role !== 'super_admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only Super Admin can create Admin accounts'
        });
      }

      await user.save();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        error: 'Failed to create user',
        message: error.message
      });
    }
  }
);

// @route   PUT /api/users/:id
// @desc    Update user details (Admin only)
// @access  Private (Admin)
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('id').isMongoId(),
    body('firstName').optional().trim().escape(),
    body('lastName').optional().trim().escape(),
    body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/),
    body('role').optional().isIn(['admin', 'customer', 'user', 'super_admin']),
    body('isActive').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const allowedUpdates = ['firstName', 'lastName', 'phone', 'role', 'isActive'];

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Check if role is being changed or if the user being updated is an admin
      const isRoleChanging = req.body.role !== undefined && req.body.role !== user.role;
      const isTargetAdmin = user.role === 'admin' || user.role === 'super_admin';
      const isNewRoleAdmin = req.body.role === 'admin' || req.body.role === 'super_admin';

      // Permission check: Only super_admin can change roles or modify admin accounts
      if ((isRoleChanging || isTargetAdmin || isNewRoleAdmin) && req.user.role !== 'super_admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only Super Admin can change user roles or modify Admin accounts'
        });
      }

      // Apply updates
      allowedUpdates.forEach(update => {
        if (req.body[update] !== undefined) {
          user[update] = req.body[update];
        }
      });

      // Requirement: Invalidate session on role change or suspension
      if (isRoleChanging || req.body.isActive === false) {
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        user.refreshToken = undefined; // Force logout on next refresh attempt
      }

      await user.save();

      res.json({
        success: true,
        message: isRoleChanging
          ? 'Role updated. The user must log in again to apply changes.'
          : 'User updated successfully',
        roleChanged: isRoleChanging,
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        error: 'Failed to update user'
      });
    }
  }
);

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private (Admin)
router.put('/:id/status',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('id').isMongoId(),
    body('statusType').isIn(['just_enquired', 'paid_initial', 'full_payment_pending', 'full_payment_moved_in', 'emi_customer'])
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { statusType: req.body.statusType },
        { new: true, runValidators: true }
      ).select('-password -refreshToken');

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        error: 'Failed to update user status'
      });
    }
  }
);

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const totalAdmins = await User.countDocuments({ role: 'admin' });

      const usersByStatus = await User.aggregate([
        { $match: { role: 'customer' } },
        {
          $group: {
            _id: '$statusType',
            count: { $sum: 1 }
          }
        }
      ]);

      const recentUsers = await User.find()
        .sort('-createdAt')
        .limit(10)
        .select('firstName lastName email role statusType createdAt');

      res.json({
        success: true,
        data: {
          total: totalUsers,
          customers: totalCustomers,
          admins: totalAdmins,
          byStatus: usersByStatus,
          recent: recentUsers
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch user statistics'
      });
    }
  }
);

module.exports = router;
