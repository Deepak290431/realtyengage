const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authenticateToken, requireSuperAdmin, authorizeRoles, optionalAuth } = require('../middleware/auth');

// @route   GET /api/virtual-tour/:projectId
// @desc    Get virtual tour data for a project
// @access  Optional Auth
router.get('/:projectId', optionalAuth, async (req, res) => {
    try {
        const { projectId } = req.params;

        let project = await Project.findById(projectId).select('virtualTour name');

        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                message: 'The requested project does not exist'
            });
        }

        // Initialize virtualTour if it doesn't exist
        if (!project.virtualTour || !project.virtualTour.type) {
            const initialVirtualTour = {
                enabled: false,
                type: 'none',
                images360: [],
                video360: {},
                viewCount: 0
            };

            // Update in DB without triggering full document validation
            await Project.updateOne(
                { _id: projectId },
                { $set: { virtualTour: initialVirtualTour } }
            );

            project.virtualTour = initialVirtualTour;
        }

        // Unique view tracking (only for logged-in users with emails)
        if (project.virtualTour && project.virtualTour.enabled && req.user?.email) {
            const userEmail = req.user.email;

            // Check if user has already viewed
            const hasViewed = project.virtualTour.uniqueViewers?.includes(userEmail);

            if (!hasViewed) {
                await Project.updateOne(
                    { _id: projectId },
                    {
                        $addToSet: { 'virtualTour.uniqueViewers': userEmail },
                        $inc: { 'virtualTour.viewCount': 1 }
                    }
                );
                // Update local object for response
                project.virtualTour.viewCount = (project.virtualTour.viewCount || 0) + 1;
                project.virtualTour.uniqueViewers = [...(project.virtualTour.uniqueViewers || []), userEmail];
            }
        }

        res.json({
            success: true,
            data: {
                projectName: project.name,
                virtualTour: project.virtualTour
            }
        });
    } catch (error) {
        console.error('Error fetching virtual tour:', error);
        res.status(500).json({
            error: 'Failed to fetch virtual tour',
            message: error.message
        });
    }
});

// @route   POST /api/virtual-tour/:projectId/360-images
// @desc    Upload 360° images (Admin/Super Admin)
// @access  Private (Admin, Super Admin)
router.post('/:projectId/360-images', authenticateToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { images } = req.body; // Array of { url, title, description, order }

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Please provide at least one 360° image'
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                message: 'The requested project does not exist'
            });
        }

        // Add new images with metadata
        const newImages = images.map((img, index) => ({
            url: img.url,
            title: img.title || `360° View ${project.virtualTour.images360.length + index + 1}`,
            description: img.description || '',
            order: img.order !== undefined ? img.order : project.virtualTour.images360.length + index,
            uploadedAt: new Date(),
            uploadedBy: req.userId
        }));
        // Update in DB without triggering full document validation
        await Project.updateOne(
            { _id: projectId },
            {
                $push: { 'virtualTour.images360': { $each: newImages } },
                $set: {
                    'virtualTour.type': '360_image',
                    'virtualTour.lastUpdated': new Date()
                }
            }
        );

        res.status(201).json({
            success: true,
            message: '360° images uploaded successfully',
            data: {
                images: newImages,
                totalImages: (project.virtualTour?.images360?.length || 0) + newImages.length
            }
        });
    } catch (error) {
        console.error('Error uploading 360° images:', error);
        res.status(500).json({
            error: 'Failed to upload images',
            message: error.message
        });
    }
});

// @route   POST /api/virtual-tour/:projectId/360-video
// @desc    Upload 360° video (Admin/Super Admin)
// @access  Private (Admin, Super Admin)
router.post('/:projectId/360-video', authenticateToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { url, title, description, duration } = req.body;

        if (!url) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Video URL is required'
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                message: 'The requested project does not exist'
            });
        }

        const video360 = {
            url,
            title: title || `${project.name} - 360° Virtual Tour`,
            description: description || '',
            duration: duration || 0,
            uploadedAt: new Date(),
            uploadedBy: req.userId
        };

        // Update in DB without triggering full document validation
        await Project.updateOne(
            { _id: projectId },
            {
                $set: {
                    'virtualTour.video360': video360,
                    'virtualTour.type': '360_video',
                    'virtualTour.lastUpdated': new Date()
                }
            }
        );

        res.status(201).json({
            success: true,
            message: '360° video uploaded successfully',
            data: video360
        });
    } catch (error) {
        console.error('Error uploading 360° video:', error);
        res.status(500).json({
            error: 'Failed to upload video',
            message: error.message
        });
    }
});

// @route   PUT /api/virtual-tour/:projectId/toggle
// @desc    Enable/Disable virtual tour (Admin/Super Admin)
// @access  Private (Admin, Super Admin)
router.put('/:projectId/toggle', authenticateToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'enabled field must be a boolean'
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                message: 'The requested project does not exist'
            });
        }

        // Check if there's any virtual tour content
        const hasContent = project.virtualTour.images360.length > 0 || project.virtualTour.video360?.url;

        if (enabled && !hasContent) {
            return res.status(400).json({
                error: 'No content available',
                message: 'Please upload 360° images or video before enabling virtual tour'
            });
        }

        // Update in DB without triggering full document validation
        await Project.updateOne(
            { _id: projectId },
            {
                $set: {
                    'virtualTour.enabled': enabled,
                    'virtualTour.lastUpdated': new Date()
                }
            }
        );

        res.json({
            success: true,
            message: `Virtual tour ${enabled ? 'enabled' : 'disabled'} successfully`,
            data: {
                enabled: enabled
            }
        });
    } catch (error) {
        console.error('Error toggling virtual tour:', error);
        res.status(500).json({
            error: 'Failed to toggle virtual tour',
            message: error.message
        });
    }
});

// @route   DELETE /api/virtual-tour/:projectId/360-images/:imageId
// @desc    Delete a 360° image (Super Admin only)
// @access  Private (Super Admin)
router.delete('/:projectId/360-images/:imageId', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { projectId, imageId } = req.params;

        const project = await Project.findById(projectId).select('virtualTour');

        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                message: 'The requested project does not exist'
            });
        }

        const newImages360 = project.virtualTour.images360.filter(
            img => img._id.toString() !== imageId
        );

        if (newImages360.length === project.virtualTour.images360.length) {
            return res.status(404).json({
                error: 'Image not found',
                message: 'The requested 360° image does not exist'
            });
        }

        const updateData = {
            'virtualTour.images360': newImages360,
            'virtualTour.lastUpdated': new Date()
        };

        // If no images left and no video, disable virtual tour
        if (newImages360.length === 0 && !project.virtualTour.video360?.url) {
            updateData['virtualTour.enabled'] = false;
            updateData['virtualTour.type'] = 'none';
        }

        await Project.updateOne(
            { _id: projectId },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: '360° image deleted successfully',
            data: {
                remainingImages: newImages360.length
            }
        });
    } catch (error) {
        console.error('Error deleting 360° image:', error);
        res.status(500).json({
            error: 'Failed to delete image',
            message: error.message
        });
    }
});

// @route   DELETE /api/virtual-tour/:projectId/360-video
// @desc    Delete 360° video (Super Admin only)
// @access  Private (Super Admin)
router.delete('/:projectId/360-video', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId).select('virtualTour');

        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                message: 'The requested project does not exist'
            });
        }

        const updateData = {
            'virtualTour.video360': {
                url: null,
                title: null,
                description: null,
                duration: null,
                uploadedAt: null,
                uploadedBy: null
            },
            'virtualTour.lastUpdated': new Date()
        };

        // If no images either, disable virtual tour
        if (project.virtualTour.images360.length === 0) {
            updateData['virtualTour.enabled'] = false;
            updateData['virtualTour.type'] = 'none';
        } else {
            updateData['virtualTour.type'] = '360_image';
        }

        await Project.updateOne(
            { _id: projectId },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: '360° video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting 360° video:', error);
        res.status(500).json({
            error: 'Failed to delete video',
            message: error.message
        });
    }
});

// @route   PUT /api/virtual-tour/:projectId/360-images/:imageId
// @desc    Update 360° image metadata (Admin/Super Admin)
// @access  Private (Admin, Super Admin)
router.put('/:projectId/360-images/:imageId', authenticateToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
    try {
        const { projectId, imageId } = req.params;
        const { title, description, order } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                message: 'The requested project does not exist'
            });
        }

        const image = project.virtualTour.images360.find(
            img => img._id.toString() === imageId
        );

        if (!image) {
            return res.status(404).json({
                error: 'Image not found',
                message: 'The requested 360° image does not exist'
            });
        }

        const updateData = {};
        if (title !== undefined) updateData['virtualTour.images360.$.title'] = title;
        if (description !== undefined) updateData['virtualTour.images360.$.description'] = description;
        if (order !== undefined) updateData['virtualTour.images360.$.order'] = order;
        updateData['virtualTour.lastUpdated'] = new Date();

        await Project.updateOne(
            { _id: projectId, 'virtualTour.images360._id': imageId },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: '360° image updated successfully'
        });
    } catch (error) {
        console.error('Error updating 360° image:', error);
        res.status(500).json({
            error: 'Failed to update image',
            message: error.message
        });
    }
});

// @route   PUT /api/virtual-tour/:projectId/360-video
// @desc    Update 360° video metadata (Admin/Super Admin)
// @access  Private (Admin, Super Admin)
router.put('/:projectId/360-video', authenticateToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                message: 'The requested project does not exist'
            });
        }

        const updateData = {};
        if (title !== undefined) updateData['virtualTour.video360.title'] = title;
        if (description !== undefined) updateData['virtualTour.video360.description'] = description;
        updateData['virtualTour.lastUpdated'] = new Date();

        await Project.updateOne(
            { _id: projectId },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: '360° video updated successfully'
        });
    } catch (error) {
        console.error('Error updating 360° video:', error);
        res.status(500).json({
            error: 'Failed to update video',
            message: error.message
        });
    }
});

module.exports = router;
