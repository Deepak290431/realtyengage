const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// @route   GET /api/admin/users
// @desc    Get all admin users (Super Admin only)
// @access  Private (Super Admin)
router.get('/users', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' })
            .select('-password -refreshToken -resetPasswordToken')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({
            error: 'Failed to fetch admin users',
            message: error.message
        });
    }
});

// @route   POST /api/admin/create
// @desc    Create new admin account (Super Admin only)
// @access  Private (Super Admin)
router.post('/create', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'All fields are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'User exists',
                message: 'An account with this email already exists'
            });
        }

        // Create new admin
        const newAdmin = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'admin',
            isVerified: true,
            authProvider: 'local'
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            data: {
                id: newAdmin._id,
                firstName: newAdmin.firstName,
                lastName: newAdmin.lastName,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
            error: 'Failed to create admin',
            message: error.message
        });
    }
});

// @route   PUT /api/admin/:id
// @desc    Update admin account (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, isActive } = req.body;

        const admin = await User.findById(id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({
                error: 'Not found',
                message: 'Admin account not found'
            });
        }

        // Update fields
        if (firstName) admin.firstName = firstName;
        if (lastName) admin.lastName = lastName;
        if (phone) admin.phone = phone;
        if (typeof isActive !== 'undefined') admin.isActive = isActive;

        await admin.save();

        res.json({
            success: true,
            message: 'Admin account updated successfully',
            data: admin
        });
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({
            error: 'Failed to update admin',
            message: error.message
        });
    }
});

// @route   PUT /api/admin/:id/block
// @desc    Block/Unblock admin account (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id/block', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const admin = await User.findById(id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({
                error: 'Not found',
                message: 'Admin account not found'
            });
        }

        admin.isActive = isActive;
        await admin.save();

        res.json({
            success: true,
            message: `Admin account ${isActive ? 'activated' : 'blocked'} successfully`,
            data: admin
        });
    } catch (error) {
        console.error('Error blocking admin:', error);
        res.status(500).json({
            error: 'Failed to block admin',
            message: error.message
        });
    }
});

// @route   DELETE /api/admin/:id
// @desc    Delete admin account (Super Admin only)
// @access  Private (Super Admin)
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await User.findById(id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({
                error: 'Not found',
                message: 'Admin account not found'
            });
        }

        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Admin account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({
            error: 'Failed to delete admin',
            message: error.message
        });
    }
});

// @route   GET /api/admin/audit-logs
// @desc    Get system audit logs (Super Admin only)
// @access  Private (Super Admin)
router.get('/audit-logs', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        // In a real implementation, you would have an AuditLog model
        // For now, returning mock data
        const auditLogs = [
            {
                id: 1,
                user: 'Super Admin',
                action: 'Updated commission rate',
                timestamp: new Date().toISOString(),
                details: 'Changed from 2% to 2.5%',
                ipAddress: req.ip
            }
        ];

        res.json({
            success: true,
            data: auditLogs
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            error: 'Failed to fetch audit logs',
            message: error.message
        });
    }
});

// @route   DELETE /api/admin/reset/enquiries
// @desc    Clear all enquiries (Super Admin only)
// @access  Private (Super Admin)
router.delete('/reset/enquiries', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const Enquiry = require('../models/Enquiry');
        await Enquiry.deleteMany({});
        res.json({ success: true, message: 'All enquiries have been cleared successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear enquiries', message: error.message });
    }
});

// @route   DELETE /api/admin/reset/projects
// @desc    Clear all projects (Super Admin only)
// @access  Private (Super Admin)
router.delete('/reset/projects', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const Project = require('../models/Project');
        await Project.deleteMany({});
        res.json({ success: true, message: 'All projects have been cleared successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear projects', message: error.message });
    }
});

// @route   DELETE /api/admin/reset/customers
// @desc    Clear all customers (Super Admin only)
// @access  Private (Super Admin)
router.delete('/reset/customers', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const User = require('../models/User');
        await User.deleteMany({ role: { $in: ['customer', 'user'] } });
        res.json({ success: true, message: 'All customers and users have been cleared successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear customers', message: error.message });
    }
});

// @route   DELETE /api/admin/reset/payments
// @desc    Clear all payments and transactions (Super Admin only)
// @access  Private (Super Admin)
router.delete('/reset/payments', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const Payment = require('../models/Payment');
        const Transaction = require('../models/Transaction');
        await Payment.deleteMany({});
        await Transaction.deleteMany({});
        res.json({ success: true, message: 'All payments and transactions have been cleared successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear payments', message: error.message });
    }
});

module.exports = router;
