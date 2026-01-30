const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');
const brochureGenerator = require('../utils/brochureGenerator');
const path = require('path');
const fs = require('fs');

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

// @route   GET /api/projects
// @desc    Get all projects with filters
// @access  Public (with optional auth for tracking)
router.get('/',
  optionalAuth,
  [
    query('status').optional({ checkFalsy: true }).isIn(['upcoming', 'in_progress', 'completed']),
    query('minPrice').optional({ checkFalsy: true }).isNumeric(),
    query('maxPrice').optional({ checkFalsy: true }).isNumeric(),
    query('area').optional({ checkFalsy: true }).trim(),
    query('page').optional({ checkFalsy: true }).isInt({ min: 1 }),
    query('limit').optional({ checkFalsy: true }).isInt({ min: 1, max: 100 }),
    query('sort').optional({ checkFalsy: true }).isIn(['price', '-price', 'name', '-name', 'createdAt', '-createdAt', 'views', '-views', 'enquiryCount', '-enquiryCount', 'salesCount', '-salesCount'])
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        status,
        minPrice,
        maxPrice,
        area,
        page = 1,
        limit = 12,
        sort = '-createdAt',
        search
      } = req.query;

      // Build filter
      const filter = { isActive: true };

      if (status) filter.status = status;
      if (area) filter.area = new RegExp(area, 'i');
      if (minPrice || maxPrice) {
        filter['pricing.basePrice'] = {};
        if (minPrice) filter['pricing.basePrice'].$gte = Number(minPrice);
        if (maxPrice) filter['pricing.basePrice'].$lte = Number(maxPrice);
      }
      if (search) {
        filter.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { area: new RegExp(search, 'i') }
        ];
      }

      // Build sort
      let sortObj = {};
      if (sort.startsWith('-')) {
        const field = sort.substring(1);
        sortObj[field === 'salesCount' ? 'availability.soldUnits' : field] = -1;
      } else {
        sortObj[sort === 'salesCount' ? 'availability.soldUnits' : sort] = 1;
      }

      // Execute query with pagination
      const projects = await Project.find(filter)
        .sort(sortObj)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');

      // Get total count for pagination
      const totalCount = await Project.countDocuments(filter);

      res.json({
        success: true,
        data: projects,
        pagination: {
          total: totalCount,
          page: Number(page),
          pages: Math.ceil(totalCount / limit),
          limit: Number(limit)
        }
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        error: 'Failed to fetch projects',
        message: 'Unable to retrieve projects'
      });
    }
  }
);

// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Public
router.get('/:id',
  optionalAuth,
  [param('id').isMongoId()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate('createdBy', 'firstName lastName email');

      if (!project || !project.isActive) {
        return res.status(404).json({
          error: 'Project not found'
        });
      }

      // Unique view tracking
      const viewerId = req.user ? (req.user.email || req.userId) : null;
      if (viewerId && !project.viewers.includes(viewerId)) {
        project.viewers.push(viewerId);
        project.views = (project.viewers.length || 0);
        await project.save();
      } else if (!viewerId) {
        // Increment guest views
        project.views += 1;
        await project.save();
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        error: 'Failed to fetch project',
        message: 'Unable to retrieve project details'
      });
    }
  }
);

// @route   GET /api/projects/:id/brochure
// @desc    Download project brochure PDF
// @access  Public
router.get('/:id/brochure',
  [param('id').isMongoId()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { filePath, fileName } = await brochureGenerator.generateBrochure(project);

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Brochure download error:', err);
        }
      });
    } catch (error) {
      console.error('Brochure generation error:', error);
      res.status(500).json({ error: 'Failed to generate brochure' });
    }
  }
);

// @route   POST /api/projects
// @desc    Create new project
// @access  Admin only
router.post('/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty(),
    body('area').notEmpty().trim(),
    body('status').isIn(['upcoming', 'in_progress', 'completed', 'ongoing']),
    body('pricing.basePrice').isNumeric({ min: 0 }),
    body('pricing.commissionPercentage').optional().isNumeric({ min: 0 }),
    body('pricing.gstRate').optional().isNumeric({ min: 0 }),
    body('pricing.gstType').optional().isIn(['inclusive', 'exclusive']),
    body('location.address').notEmpty(),
    body('location.latitude').isFloat({ min: -90, max: 90 }),
    body('location.longitude').isFloat({ min: -180, max: 180 }),
    body('configurations').optional().isArray(),
    body('amenities').optional().isArray(),
    body('reraId').optional().trim(),
    body('completionDate').optional({ checkFalsy: true }).isISO8601()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const projectData = {
        ...req.body,
        createdBy: req.userId
      };

      const project = new Project(projectData);
      await project.save();

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('Create project error details:', error);
      res.status(500).json({
        error: 'Failed to create project',
        message: error.message || 'Unable to create new project',
        details: error.errors // This will send back Mongoose validation errors
      });
    }
  }
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Admin only
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('id').isMongoId(),
    body('name').optional().trim(),
    body('status').optional().isIn(['upcoming', 'in_progress', 'completed', 'ongoing']),
    body('builder').optional().trim(),
    body('possession').optional().trim(),
    body('pricing.basePrice').optional().isNumeric({ min: 0 }),
    body('pricing.commissionPercentage').optional().isNumeric({ min: 0 }),
    body('pricing.gstRate').optional().isNumeric({ min: 0 }),
    body('pricing.gstType').optional().isIn(['inclusive', 'exclusive']),
    body('location.address').optional().trim(),
    body('location.latitude').optional().isFloat({ min: -90, max: 90 }),
    body('location.longitude').optional().isFloat({ min: -180, max: 180 }),
    body('configurations').optional().isArray(),
    body('amenities').optional().isArray(),
    body('reraId').optional().trim(),
    body('completionDate').optional({ checkFalsy: true }).isISO8601()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updates = req.body;

      // Don't allow updating certain fields
      delete updates._id;
      delete updates.createdBy;
      delete updates.createdAt;
      delete updates.views;
      delete updates.enquiryCount;

      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!project) {
        return res.status(404).json({
          error: 'Project not found'
        });
      }

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        error: 'Failed to update project',
        message: 'Unable to update project'
      });
    }
  }
);

// @route   DELETE /api/projects/:id
// @desc    Delete project (soft delete)
// @access  Admin only
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  [param('id').isMongoId()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!project) {
        return res.status(404).json({
          error: 'Project not found'
        });
      }

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        error: 'Failed to delete project',
        message: 'Unable to delete project'
      });
    }
  }
);

// @route   POST /api/projects/:id/images
// @desc    Add images to project
// @access  Admin only
router.post('/:id/images',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('id').isMongoId(),
    body('images').isArray({ min: 1 }),
    body('images.*.url').isURL(),
    body('images.*.caption').optional().trim()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { images } = req.body;

      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          error: 'Project not found'
        });
      }

      // Add new images
      project.images.push(...images);

      // Ensure only one primary image
      const primaryCount = project.images.filter(img => img.isPrimary).length;
      if (primaryCount === 0 && project.images.length > 0) {
        project.images[0].isPrimary = true;
      }

      await project.save();

      res.json({
        success: true,
        message: 'Images added successfully',
        data: project
      });
    } catch (error) {
      console.error('Add images error:', error);
      res.status(500).json({
        error: 'Failed to add images',
        message: 'Unable to add images to project'
      });
    }
  }
);

// @route   DELETE /api/projects/:id/images/:imageId
// @desc    Remove image from project
// @access  Admin only
router.delete('/:id/images/:imageId',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('id').isMongoId(),
    param('imageId').isMongoId()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          error: 'Project not found'
        });
      }

      // Remove image
      project.images = project.images.filter(
        img => img._id.toString() !== req.params.imageId
      );

      // Ensure at least one primary image if images exist
      const hasPrimary = project.images.some(img => img.isPrimary);
      if (!hasPrimary && project.images.length > 0) {
        project.images[0].isPrimary = true;
      }

      await project.save();

      res.json({
        success: true,
        message: 'Image removed successfully',
        data: project
      });
    } catch (error) {
      console.error('Remove image error:', error);
      res.status(500).json({
        error: 'Failed to remove image',
        message: 'Unable to remove image from project'
      });
    }
  }
);

// @route   GET /api/projects/stats/overview
// @desc    Get project statistics
// @access  Admin only
router.get('/stats/overview',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const stats = await Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$pricing.basePrice' },
            avgPrice: { $avg: '$pricing.basePrice' },
            totalUnits: { $sum: '$availability.totalUnits' },
            availableUnits: { $sum: '$availability.availableUnits' },
            soldUnits: { $sum: '$availability.soldUnits' }
          }
        }
      ]);

      const totalProjects = await Project.countDocuments({ isActive: true });
      const totalViews = await Project.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]);
      const totalEnquiries = await Project.aggregate([
        { $group: { _id: null, total: { $sum: '$enquiryCount' } } }
      ]);

      res.json({
        success: true,
        data: {
          byStatus: stats,
          totals: {
            projects: totalProjects,
            views: totalViews[0]?.total || 0,
            enquiries: totalEnquiries[0]?.total || 0
          }
        }
      });
    } catch (error) {
      console.error('Get project stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics',
        message: 'Unable to retrieve project statistics'
      });
    }
  }
);

module.exports = router;
