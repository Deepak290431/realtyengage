const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Enquiry = require('../models/Enquiry');
const Payment = require('../models/Payment');
const SupportRequest = require('../models/SupportRequest');
const Transaction = require('../models/Transaction');

// @route   GET /api/dashboard/customer-stats
// @desc    Get customer statistics (Admin only)
// @access  Private (Admin)
router.get('/customer-stats',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const totalCustomers = await User.countDocuments({ role: 'customer' });

      const customersByStatus = await User.aggregate([
        { $match: { role: 'customer' } },
        {
          $group: {
            _id: '$statusType',
            count: { $sum: 1 }
          }
        }
      ]);

      const recentCustomers = await User.find({ role: 'customer' })
        .sort('-createdAt')
        .limit(5)
        .select('firstName lastName email createdAt statusType');

      res.json({
        success: true,
        data: {
          total: totalCustomers,
          byStatus: customersByStatus,
          recent: recentCustomers
        }
      });
    } catch (error) {
      console.error('Get customer stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch customer statistics'
      });
    }
  }
);

// @route   GET /api/dashboard/project-stats
// @desc    Get project statistics (Admin only)
// @access  Private (Admin)
router.get('/project-stats',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const stats = await Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$pricing.basePrice' }
          }
        }
      ]);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get project stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch project statistics'
      });
    }
  }
);

// @route   GET /api/dashboard/revenue-stats
// @desc    Get revenue statistics (Admin only)
// @access  Private (Admin)
router.get('/revenue-stats',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const stats = await Payment.getStatistics();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get revenue stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch revenue statistics'
      });
    }
  }
);

// @route   GET /api/dashboard/quick-stats
// @desc    Get quick statistics for dashboard
// @access  Private
router.get('/quick-stats',
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role === 'admin') {
        const [projects, enquiries, payments, tickets, customers] = await Promise.all([
          Project.countDocuments({ isActive: true }),
          Enquiry.countDocuments(),
          Payment.countDocuments({ status: 'success' }),
          SupportRequest.countDocuments(),
          User.countDocuments({ role: 'customer' })
        ]);

        res.json({
          success: true,
          data: {
            projects,
            enquiries,
            payments,
            tickets,
            customers
          }
        });
      } else {
        // Customer quick stats
        const [enquiries, payments, tickets] = await Promise.all([
          Enquiry.countDocuments({ customerId: req.userId }),
          Payment.countDocuments({ customerId: req.userId, status: 'success' }),
          SupportRequest.countDocuments({ customerId: req.userId })
        ]);

        res.json({
          success: true,
          data: {
            enquiries,
            payments,
            tickets
          }
        });
      }
    } catch (error) {
      console.error('Get quick stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics'
      });
    }
  }
);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics for current user
// @access  Private
router.get('/stats',
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role === 'admin') {
        const stats = await getAdminStats();
        return res.json({ success: true, data: stats });
      } else {
        const stats = await getCustomerStats(req.userId);
        return res.json({ success: true, data: stats });
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }
);

// @route   GET /api/dashboard/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/admin/stats',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const stats = await getAdminStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
  }
);

// @route   GET /api/dashboard/activities
// @desc    Get recent activities
// @access  Private
router.get('/activities',
  authenticateToken,
  async (req, res) => {
    try {
      const filter = req.user.role === 'admin' ? {} : { customerId: req.userId };

      const [payments, enquiries] = await Promise.all([
        Payment.find(filter).sort('-createdAt').limit(5).populate('projectId customerId'),
        Enquiry.find(filter).sort('-createdAt').limit(5).populate('projectId customerId')
      ]);

      const activities = [
        ...payments.map(p => ({
          _id: p._id,
          type: 'payment',
          description: `Payment of ₹${p.amount} for ${p.projectId?.name || 'Project'}`,
          status: p.status === 'success' ? 'completed' : 'pending',
          date: p.createdAt,
          customerId: p.customerId
        })),
        ...enquiries.map(e => ({
          _id: e._id,
          type: 'enquiry',
          description: `New enquiry for ${e.projectId?.name || 'Project'}`,
          status: e.status === 'new' ? 'pending' : 'completed',
          date: e.createdAt,
          customerId: e.customerId
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

      res.json({ success: true, data: activities });
    } catch (error) {
      console.error('Get activities error:', error);
      res.status(500).json({ error: 'Failed to fetch recent activities' });
    }
  }
);

// @route   GET /api/dashboard/charts
// @desc    Get chart data for revenue/sales
// @access  Private (Admin)
router.get('/charts',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { period = '6months' } = req.query;

      const stats = await Transaction.aggregate([
        { $match: { paymentStatus: 'success' } },
        {
          $group: {
            _id: {
              month: { $month: '$paymentDate' },
              year: { $year: '$paymentDate' }
            },
            sales: { $sum: { $ifNull: ['$amountPaid', 0] } },
            revenue: {
              $sum: {
                $add: [
                  { $ifNull: ['$commissionAmount', 0] },
                  { $ifNull: ['$gstAmount', 0] }
                ]
              }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const chartData = stats.map(s => ({
        month: monthNames[s._id.month - 1],
        sales: s.sales,
        revenue: s.revenue
      }));

      res.json({ success: true, data: chartData });
    } catch (error) {
      console.error('Get chart data error:', error);
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  }
);

// Helper functions
// Debug counting
async function getAdminStats() {
  console.log('Calculating Admin Stats...');

  const [transactionStats, propertyBreakdown, totalProjects, activeProjects, totalUsers, newUsers, totalEnquiries, pendingEnquiries] = await Promise.all([
    Transaction.aggregate([
      { $match: { paymentStatus: { $in: ['success', 'refund'] } } },
      {
        $group: {
          _id: null,
          totalPlatformRevenue: { $sum: { $ifNull: ['$commissionAmount', 0] } },
          totalGST: { $sum: { $ifNull: ['$gstAmount', 0] } },
          totalPenalties: { $sum: { $ifNull: ['$penaltyAmount', 0] } },
          lateEMICount: { $sum: { $cond: [{ $eq: ['$isLatePayment', true] }, 1, 0] } },
          totalSalesValue: { $sum: { $ifNull: ['$amountPaid', 0] } },
          totalOwnerPayout: { $sum: { $ifNull: ['$ownerPayout', 0] } }
        }
      }
    ]),
    Transaction.aggregate([
      { $match: { paymentStatus: { $in: ['success', 'refund'] } } },
      {
        $group: {
          _id: '$propertyId',
          propertyName: { $first: '$propertyName' },
          totalSales: { $sum: { $ifNull: ['$amountPaid', 0] } },
          totalCommission: { $sum: { $ifNull: ['$commissionAmount', 0] } },
          totalGST: { $sum: { $ifNull: ['$gstAmount', 0] } },
          totalPenalties: { $sum: { $ifNull: ['$penaltyAmount', 0] } },
          totalOwnerPayout: { $sum: { $ifNull: ['$ownerPayout', 0] } },
          totalLate: { $sum: { $cond: [{ $eq: ['$isLatePayment', true] }, 1, 0] } },
          transactionCount: { $sum: 1 },
          totalRefunds: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'refund'] }, { $abs: '$amountPaid' }, 0]
            }
          }
        }
      },
      { $sort: { totalSales: -1 } }
    ]),
    Project.countDocuments({ isActive: true }),
    Project.countDocuments({ status: 'in_progress', isActive: true }),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: 'new' })
  ]);

  const stats = transactionStats[0] || {
    totalPlatformRevenue: 0,
    totalSalesValue: 0,
    totalOwnerPayout: 0
  };

  return {
    totalRevenue: (stats.totalPlatformRevenue || 0) + (stats.totalGST || 0) + (stats.totalPenalties || 0),
    netEarnings: (stats.totalPlatformRevenue || 0) + (stats.totalPenalties || 0),
    totalPlatformRevenue: stats.totalPlatformRevenue || 0,
    totalGST: stats.totalGST || 0,
    totalPenalties: stats.totalPenalties || 0,
    lateEMICount: stats.lateEMICount || 0,
    totalSalesValue: stats.totalSalesValue || 0,
    totalOwnerPayout: stats.totalOwnerPayout || 0,
    propertyBreakdown,
    revenueGrowth: 0,
    totalProjects,
    activeProjects,
    totalUsers,
    newUsers,
    totalEnquiries,
    pendingEnquiries
  };
}

async function getCustomerStats(userId) {
  const [paymentsResp, enquiries] = await Promise.all([
    Payment.getStatistics({ customerId: userId }),
    Enquiry.find({ customerId: userId })
  ]);

  return {
    totalInvested: paymentsResp.totalAmount || 0,
    pendingPayments: enquiries.filter(e => e.status === 'in_progress' && !e.isOk).length,
    totalProperties: enquiries.filter(e => e.isOk).length,
    activeEnquiries: enquiries.length
  };
}

module.exports = router;

