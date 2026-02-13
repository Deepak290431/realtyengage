const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get app settings
// @access  Private (Admin usually, but some might be public?)
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.getInstance();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// @route   PUT /api/settings
// @desc    Update app settings
// @access  Private (Super Admin)
router.put('/', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
    try {
        // We can just update the singleton
        // Use findOneAndUpdate with upsert to ensure we always have one document
        // Return the new document
        const settings = await Settings.findOneAndUpdate(
            {},
            req.body,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
