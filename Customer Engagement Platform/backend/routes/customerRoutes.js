const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const Project = require('../models/Project'); // Needed for population if used
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/customers
// @desc    Get all customers with their latest enquiry details
// @access  Private (Admin)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { search, status, sort = '-createdAt' } = req.query;

        // Base match for Users
        const matchLine = { role: 'customer' };
        if (search) {
            matchLine.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Pipeline to join with Enquiries
        const pipeline = [
            { $match: matchLine },
            {
                $lookup: {
                    from: 'enquiries',
                    let: { userId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$customerId', '$$userId'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'latestEnquiry'
                }
            },
            { $unwind: { path: '$latestEnquiry', preserveNullAndEmptyArrays: true } },
            // Lookup Project details for the enquiry
            {
                $lookup: {
                    from: 'projects',
                    localField: 'latestEnquiry.projectId',
                    foreignField: '_id',
                    as: 'interestedProperty'
                }
            },
            { $unwind: { path: '$interestedProperty', preserveNullAndEmptyArrays: true } },
            // Lookup Assigned Admin
            {
                $lookup: {
                    from: 'users',
                    localField: 'latestEnquiry.assignedTo',
                    foreignField: '_id',
                    as: 'assignedAdmin'
                }
            },
            { $unwind: { path: '$assignedAdmin', preserveNullAndEmptyArrays: true } }
        ];

        // Filter by Enquiry Status if provided
        if (status && status !== 'All') {
            pipeline.push({
                $match: { 'latestEnquiry.status': status } // Matches Enquiry status
            });
        }

        // Sort
        let sortStage = {};
        if (sort === 'name') {
            sortStage = { firstName: 1 };
        } else if (sort === 'date') {
            sortStage = { createdAt: -1 };
        } else {
            sortStage = { createdAt: -1 };
        }
        pipeline.push({ $sort: sortStage });

        const customers = await User.aggregate(pipeline);

        // Transform data for frontend
        const formattedCustomers = customers.map(c => ({
            _id: c._id,
            fullName: `${c.firstName} ${c.lastName}`,
            email: c.email,
            phone: c.phone || 'N/A',
            profilePicture: c.profilePicture,
            interestedProperty: c.interestedProperty ? c.interestedProperty.name : 'General Enquiry',
            enquiryStatus: c.latestEnquiry ? c.latestEnquiry.status : 'New', // Default to New if no enquiry
            lastContactedDate: c.latestEnquiry ? c.latestEnquiry.updatedAt : c.createdAt,
            assignedAdmin: c.assignedAdmin ? `${c.assignedAdmin.firstName} ${c.assignedAdmin.lastName}` : 'Unassigned',
            tags: c.statusType // Mapping User statusType as tags for now
        }));

        res.json({
            success: true,
            data: formattedCustomers
        });

    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// @route   GET /api/customers/:id
// @desc    Get single customer full details
// @access  Private (Admin)
router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const enquiries = await Enquiry.find({ customerId: user._id })
            .populate('projectId', 'name type location')
            .populate('assignedTo', 'firstName lastName')
            .populate('notes.addedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                personalDetails: user,
                enquiries: enquiries,
                // Calculate aggregate stats or tags
                tags: [user.statusType]
            }
        });
    } catch (error) {
        console.error('Get customer details error:', error);
        res.status(500).json({ error: 'Failed to fetch customer details' });
    }
});

// @route   POST /api/customers/:id/notes
// @desc    Add note to customer (latest enquiry)
// @access  Private (Admin)
router.post('/:id/notes', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { text, enquiryId } = req.body;

        let enquiry;
        if (enquiryId) {
            enquiry = await Enquiry.findById(enquiryId);
        } else {
            // Find latest enquiry
            enquiry = await Enquiry.findOne({ customerId: req.params.id }).sort({ createdAt: -1 });
        }

        if (!enquiry) {
            // If no enquiry exists, maybe create a general one? Or just error for now.
            return res.status(404).json({ error: 'No active enquiry found for this customer to add notes to.' });
        }

        enquiry.notes.push({
            text,
            addedBy: req.userId,
            isInternal: true,
            addedAt: new Date()
        });

        await enquiry.save();

        res.json({ success: true, data: enquiry });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// @route   PUT /api/customers/:id/status
// @desc    Update customer status/tags
// @access  Private (Admin)
router.put('/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { status, type } = req.body; // type: 'enquiry' or 'user'

        if (type === 'user') {
            const user = await User.findByIdAndUpdate(req.params.id, { statusType: status }, { new: true });
            return res.json({ success: true, data: user });
        } else {
            // Update latest enquiry status
            const enquiry = await Enquiry.findOne({ customerId: req.params.id }).sort({ createdAt: -1 });
            if (enquiry) {
                enquiry.status = status;
                await enquiry.save();
                return res.json({ success: true, data: enquiry });
            } else {
                return res.status(404).json({ error: 'No enquiry found' });
            }
        }
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
