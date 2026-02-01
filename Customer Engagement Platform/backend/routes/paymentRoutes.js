const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Project = require('../models/Project');
const User = require('../models/User');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');
const InvoiceGenerator = require('../utils/invoiceGenerator');
const Transaction = require('../models/Transaction');
const Enquiry = require('../models/Enquiry');
const crypto = require('crypto');
// const Razorpay = require('razorpay'); // Uncomment when Razorpay is configured

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

// Initialize Razorpay (uncomment when configured)
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// @route   POST /api/payments/initiate
// @desc    Initiate payment
// @access  Private (Customer)
router.post('/initiate',
  authenticateToken,
  [
    body('projectId').isMongoId(),
    body('amount').isNumeric({ min: 1 }),
    body('paymentType').isIn(['booking', 'down_payment', 'emi', 'full_payment', 'other']),
    body('method').isIn(['card', 'bank_transfer', 'upi', 'cash', 'cheque'])
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { projectId, amount, paymentType, method } = req.body;

      // Verify project exists
      const project = await Project.findById(projectId);
      if (!project || !project.isActive) {
        return res.status(404).json({
          error: 'Project not found'
        });
      }

      // 1. [CHECK] Verify if the customer has an 'OK' enquiry for this project
      const Enquiry = require('../models/Enquiry');
      const okEnquiry = await Enquiry.findOne({
        customerId: req.userId,
        projectId: projectId,
        isOk: true
      });

      if (!okEnquiry) {
        return res.status(403).json({
          error: 'Payment Restricted',
          message: 'You can only make a payment after your enquiry has been marked as "OK" by the admin.'
        });
      }

      // Create payment record
      const payment = new Payment({
        customerId: req.userId,
        projectId,
        amount,
        paymentType,
        method,
        status: 'pending'
      });

      // Initialize installments in Enquiry if this is the first payment and plan is chosen
      if (!okEnquiry.paymentPlan) {
        okEnquiry.paymentPlan = paymentType === 'full_payment' ? 'full' : 'emi';

        if (okEnquiry.paymentPlan === 'emi') {
          // Create 60 installments
          const installments = [];
          const basePrice = project.pricing?.basePrice || 1000000;
          const bookingAmount = Math.round(basePrice * 0.1);
          const emiAmount = Math.round((basePrice - bookingAmount) / 60);

          // First one is booking
          installments.push({
            number: 1,
            amount: bookingAmount,
            dueDate: new Date(),
            status: 'pending'
          });

          for (let i = 2; i <= 61; i++) {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
            installments.push({
              number: i,
              amount: emiAmount,
              dueDate: dueDate,
              status: 'pending'
            });
          }
          okEnquiry.installments = installments;
        } else {
          // Full payment
          okEnquiry.installments = [{
            number: 1,
            amount: project.pricing?.basePrice || 1000000,
            dueDate: new Date(),
            status: 'pending'
          }];
        }
        await okEnquiry.save();
      }

      // 2. [TEST MODE] Simulate Razorpay order creation for 'Test Mode'
      if (['card', 'upi', 'cash', 'bank_transfer'].includes(method)) {
        // In a real app, you would use Razorpay here. For this "Original Web App" quality demo:
        payment.gatewayDetails = {
          provider: (method === 'cash' || method === 'bank_transfer') ? 'offline' : 'razorpay',
          orderId: (method === 'cash' || method === 'bank_transfer') ? `${method}_order_${Math.random().toString(36).substr(2, 9)}` : `order_test_${Math.random().toString(36).substr(2, 9)}`,
          paymentId: null
        };
      }

      await payment.save();

      res.status(201).json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          payment,
          razorpayOrderId: payment.gatewayDetails?.orderId,
          razorpayKey: 'rzp_test_mock_key' // Return a mock key for frontend simulation
        }
      });
    } catch (error) {
      console.error('Initiate payment error:', error);
      res.status(500).json({
        error: 'Failed to initiate payment',
        message: 'Unable to process payment request'
      });
    }
  }
);

// @route   POST /api/payments/verify
// @desc    Verify payment after Razorpay callback
// @access  Private (Customer)
router.post('/verify',
  authenticateToken,
  [
    body('paymentId').notEmpty(),
    body('orderId').notEmpty(),
    body('signature').optional()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { paymentId, orderId, signature } = req.body;

      // Find payment by order ID
      const payment = await Payment.findOne({
        'gatewayDetails.orderId': orderId,
        customerId: req.userId
      });

      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }

      // TODO: Verify signature with Razorpay
      // const crypto = require('crypto');
      // const expectedSignature = crypto
      //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      //   .update(`${orderId}|${paymentId}`)
      //   .digest('hex');
      // 
      // if (expectedSignature !== signature) {
      //   payment.status = 'failed';
      //   payment.failureReason = 'Invalid signature';
      //   await payment.save();
      //   return res.status(400).json({ error: 'Payment verification failed' });
      // }

      // Update payment status
      await payment.updateStatus('success', {
        paymentId,
        signature
      });

      // Create Transaction record
      const enquiry = await Enquiry.findOne({
        customerId: req.userId,
        projectId: payment.projectId,
        isOk: true
      }).populate('projectId');

      if (!enquiry) {
        console.warn(`[Payment Verify] No Enquiry found for Customer: ${req.userId}, Project: ${payment.projectId}`);
      }

      const pricing = enquiry?.projectId?.pricing || {};
      const commissionPercentage = pricing.commissionPercentage || 2;
      const gstRate = pricing.gstRate || 18;
      const gstType = pricing.gstType || 'exclusive';
      const penaltyConfig = pricing.penaltyConfig || { latePenaltyType: 'fixed', latePenaltyValue: 0, gracePeriodDays: 0 };

      // Calculate Penalty if it's an EMI
      let penaltyAmount = 0;
      let isLatePayment = false;
      const installmentNumber = req.body.installmentNumber || 1;

      let installmentType = 'emi';
      if (payment.paymentType === 'full_payment') {
        installmentType = 'full';
      } else if (payment.paymentType === 'down_payment' || payment.paymentType === 'booking') {
        installmentType = 'down_payment';
      }

      if (enquiry && installmentType === 'emi' && installmentNumber > 0) {
        const inst = enquiry.installments?.find(i => i.number === installmentNumber);
        if (inst && inst.dueDate) {
          const dueDate = new Date(inst.dueDate);
          const graceDate = new Date(dueDate);
          graceDate.setDate(graceDate.getDate() + (penaltyConfig.gracePeriodDays || 0));

          if (new Date() > graceDate) {
            isLatePayment = true;
            if (penaltyConfig.latePenaltyType === 'fixed') {
              penaltyAmount = penaltyConfig.latePenaltyValue || 0;
            } else if (penaltyConfig.latePenaltyType === 'percentage') {
              penaltyAmount = (inst.amount * (penaltyConfig.latePenaltyValue || 0)) / 100;
            }
          }
        }
      }

      // Base amount for commission is total paid minus penalty
      // Penalty belongs 100% to platform
      const amountForCommission = Math.max(0, payment.amount - penaltyAmount);
      const baseCommission = (amountForCommission * commissionPercentage) / 100;
      let commissionAmount, gstAmount;

      if (gstType === 'exclusive') {
        commissionAmount = baseCommission;
        gstAmount = (baseCommission * gstRate) / 100;
      } else {
        // Inclusive: baseCommission is what the platform takes in total
        commissionAmount = baseCommission / (1 + (gstRate / 100));
        gstAmount = baseCommission - commissionAmount;
      }

      const totalPlatformEarnings = commissionAmount + gstAmount + penaltyAmount; // Penalty belongs 100% to platform
      const ownerPayout = payment.amount - totalPlatformEarnings;

      const transaction = new Transaction({
        userId: req.userId,
        propertyId: payment.projectId,
        propertyName: enquiry?.projectId?.name || 'Property Payment',
        amountPaid: payment.amount,
        commissionAmount: commissionAmount,
        gstAmount: gstAmount,
        gstRate: gstRate,
        gstType: gstType,
        ownerPayout: ownerPayout,
        paymentMethod: payment.method,
        paymentStatus: 'success',
        installmentType: installmentType,
        installmentNumber: installmentNumber,
        penaltyAmount: penaltyAmount,
        isLatePayment: isLatePayment,
        paymentDate: new Date()
      });
      await transaction.save();
      console.log(`[Payment Verify] Transaction created: ${transaction._id} for User: ${req.userId}`);

      // Update installment status in Enquiry
      if (enquiry) {
        const instIndex = enquiry.installments.findIndex(inst => inst.number === (req.body.installmentNumber || 1));
        if (instIndex !== -1) {
          enquiry.installments[instIndex].status = 'paid';
          enquiry.installments[instIndex].paidAt = new Date();
          enquiry.installments[instIndex].transactionId = transaction._id;
          await enquiry.save();
        }
      }

      // Update user status if first payment
      const user = await User.findById(req.userId);
      if (user.statusType === 'just_enquired') {
        if (payment.paymentType === 'booking' || payment.paymentType === 'down_payment' || payment.paymentType === 'emi') {
          user.statusType = 'paid_initial';
        } else if (payment.paymentType === 'full_payment') {
          user.statusType = 'full_payment_pending';
        }
        await user.save();
      }

      // Generate invoice
      try {
        const populatedPayment = await Payment.findById(payment._id)
          .populate('customerId', 'firstName lastName email phone address')
          .populate('projectId', 'name area status specifications');

        const invoiceGenerator = new InvoiceGenerator();
        const invoiceData = {
          ...populatedPayment.toObject(),
          customer: populatedPayment.customerId,
          project: populatedPayment.projectId,
          invoice: {
            number: `INV${Date.now()}`
          }
        };

        const invoice = await invoiceGenerator.generateHTMLInvoice(invoiceData);

        // Save invoice details to payment
        payment.invoice = {
          number: invoiceData.invoice.number,
          url: `/api/payments/${payment._id}/invoice`,
          generatedAt: new Date()
        };
        await payment.save();
      } catch (invoiceError) {
        console.error('Invoice generation error:', invoiceError);
        // Don't fail the payment if invoice generation fails
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        error: 'Failed to verify payment',
        message: 'Unable to confirm payment'
      });
    }
  }
);

// @route   GET /api/payments
// @desc    Get payments (Admin: all, Customer: own)
// @access  Private
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const { status, paymentType, page = 1, limit = 10, sort = '-createdAt' } = req.query;

      // Build filter
      let filter = {};
      if (req.user.role === 'customer') {
        filter.customerId = req.userId;
      }
      if (status) filter.status = status;
      if (paymentType) filter.paymentType = paymentType;

      // Build sort
      let sortObj = {};
      if (sort.startsWith('-')) {
        sortObj[sort.substring(1)] = -1;
      } else {
        sortObj[sort] = 1;
      }

      // Execute query with pagination
      const payments = await Payment.find(filter)
        .populate('projectId', 'name area')
        .populate('customerId', 'firstName lastName email')
        .sort(sortObj)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalCount = await Payment.countDocuments(filter);

      res.json({
        success: true,
        data: payments,
        pagination: {
          total: totalCount,
          page: Number(page),
          pages: Math.ceil(totalCount / limit),
          limit: Number(limit)
        }
      });
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({
        error: 'Failed to fetch payments',
        message: 'Unable to retrieve payment history'
      });
    }
  }
);

// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private (Owner or Admin)
router.get('/:id',
  authenticateToken,
  [param('id').isMongoId()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id)
        .populate('projectId')
        .populate('customerId', 'firstName lastName email phone');

      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }

      // Check authorization
      const isOwner = payment.customerId._id.toString() === req.userId.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        error: 'Failed to fetch payment',
        message: 'Unable to retrieve payment details'
      });
    }
  }
);

// @route   POST /api/payments/:id/refund
// @desc    Initiate refund (Admin only)
// @access  Private (Admin)
router.post('/:id/refund',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('id').isMongoId(),
    body('amount').isNumeric({ min: 1 }),
    body('reason').notEmpty().trim()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }

      await payment.initiateRefund(req.body.amount, req.body.reason);

      // Create refund transaction
      const project = await Project.findById(payment.projectId);
      const user = await User.findById(payment.customerId);

      const refundTransaction = new Transaction({
        userId: payment.customerId,
        propertyId: payment.projectId,
        propertyName: project.name,
        amountPaid: -req.body.amount, // Negative for accounting
        commissionAmount: 0, // Commission not refunded
        gstAmount: 0,
        gstRate: project.pricing?.gstRate || 18,
        gstType: project.pricing?.gstType || 'exclusive',
        ownerPayout: -req.body.amount, // Owner loses the full refund amount
        paymentMethod: payment.method,
        paymentStatus: 'refund',
        installmentType: 'full', // Or whatever appropriate
        paymentDate: new Date()
      });
      await refundTransaction.save();

      res.json({
        success: true,
        message: 'Refund initiated successfully and recorded.',
        data: payment
      });
    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json({
        error: 'Failed to initiate refund',
        message: error.message || 'Unable to process refund'
      });
    }
  }
);

// @route   GET /api/payments/stats/overview
// @desc    Get payment statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      // Get core statistics from Payment model
      const stats = await Payment.getStatistics();

      const revenueStats = await Transaction.aggregate([
        { $match: { paymentStatus: 'success' } },
        {
          $group: {
            _id: null,
            totalPlatformRevenue: { $sum: '$commissionAmount' },
            totalGST: { $sum: { $ifNull: ['$gstAmount', 0] } },
            totalOwnerPayout: { $sum: '$ownerPayout' }
          }
        }
      ]);

      const rev = revenueStats[0] || { totalPlatformRevenue: 0, totalGST: 0, totalOwnerPayout: 0 };

      // Get EMI defaulters
      const defaulters = await Payment.getEMIDefaulters();

      res.json({
        success: true,
        data: {
          ...stats,
          totalPlatformRevenue: rev.totalPlatformRevenue,
          totalGST: rev.totalGST,
          totalRevenue: rev.totalPlatformRevenue + rev.totalGST,
          totalOwnerPayout: rev.totalOwnerPayout,
          emiDefaulters: defaulters.length,
          defaultersList: defaulters
        }
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics',
        message: 'Unable to retrieve payment statistics'
      });
    }
  }
);

// @route   GET /api/payments/:id/invoice
// @desc    Get payment invoice
// @access  Private (Owner or Admin)
router.get('/:id/invoice',
  optionalAuth,
  [param('id').isMongoId()],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Manual security check because browser downloads sometimes skip headers
      let user = req.user;

      if (!user && req.query.token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
          user = await User.findById(decoded.userId);
        } catch (e) {
          console.error('Invoice URL Token Error:', e.message);
        }
      }

      if (!user) {
        return res.status(401).json({ error: 'Authentication required', message: 'Please login to download invoices' });
      }

      // 1. Try finding a Payment record
      let payment = await Payment.findById(req.params.id)
        .populate('customerId', 'firstName lastName email phone address')
        .populate('projectId', 'name area status specifications');

      let invoiceData;

      if (payment) {
        // Check authorization
        const isOwner = payment.customerId._id.toString() === user._id.toString();
        const isAdmin = user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Access denied' });

        invoiceData = {
          ...payment.toObject(),
          customer: payment.customerId,
          project: payment.projectId,
          receiptNumber: payment.gatewayDetails?.transactionId || payment.gatewayDetails?.orderId || payment._id,
          // Try to find an associated transaction to get GST info
          gstAmount: 0,
          gstRate: 18,
          penaltyAmount: 0
        };

        // Try to fetch transaction for additional details if it's a success
        if (payment.status === 'success') {
          const transaction = await Transaction.findOne({ userId: payment.customerId._id, propertyId: payment.projectId._id }).sort({ createdAt: -1 });
          if (transaction) {
            invoiceData.gstAmount = transaction.gstAmount;
            invoiceData.gstRate = transaction.gstRate;
            invoiceData.penaltyAmount = transaction.penaltyAmount;
          }
        }
      } else {
        // 2. Try finding a Transaction record
        const Transaction = require('../models/Transaction');
        const transaction = await Transaction.findById(req.params.id)
          .populate('userId', 'firstName lastName email phone address')
          .populate('propertyId', 'name area status specifications');

        if (!transaction) return res.status(404).json({ error: 'Record not found' });

        // Check authorization
        const isOwner = transaction.userId._id.toString() === user._id.toString();
        const isAdmin = user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Access denied' });

        // Map Transaction to Invoice format
        invoiceData = {
          _id: transaction._id,
          amount: transaction.amountPaid,
          paymentType: transaction.installmentType,
          method: transaction.paymentMethod,
          status: transaction.paymentStatus,
          paidAt: transaction.paymentDate,
          customer: transaction.userId,
          project: transaction.propertyId,
          receiptNumber: transaction._id.toString(),
          gatewayDetails: { transactionId: transaction._id },
          gstAmount: transaction.gstAmount,
          gstRate: transaction.gstRate,
          penaltyAmount: transaction.penaltyAmount
        };
      }

      // Generate PDF invoice
      const invoiceGenerator = new InvoiceGenerator();
      const { filePath, fileName } = await invoiceGenerator.generateInvoice(invoiceData);

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Invoice download error:', err);
        }
      });
    } catch (error) {
      console.error('Invoice system error:', error);
      res.status(500).json({
        error: 'Failed to generate invoice',
        message: error.message
      });
    }
  }
);

// @route   POST /api/payments/calculate-emi
// @desc    Calculate EMI for a given amount
// @access  Public
router.post('/calculate-emi',
  [
    body('principal').isNumeric({ min: 1 }),
    body('rate').isNumeric({ min: 0 }),
    body('tenure').isInt({ min: 1 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { principal, rate, tenure } = req.body;

      const monthlyRate = rate / 12 / 100;
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1);

      const totalAmount = Math.round(emi * tenure);
      const totalInterest = totalAmount - principal;

      res.json({
        success: true,
        data: {
          monthlyEMI: Math.round(emi),
          totalAmount,
          totalInterest,
          principal,
          rate,
          tenure,
          breakdown: Array.from({ length: Math.min(tenure, 12) }, (_, i) => {
            const month = i + 1;
            const interestComponent = Math.round(principal * monthlyRate);
            const principalComponent = Math.round(emi - interestComponent);
            return {
              month,
              emi: Math.round(emi),
              principal: principalComponent,
              interest: interestComponent,
              balance: Math.round(principal - (principalComponent * month))
            };
          })
        }
      });
    } catch (error) {
      console.error('EMI calculation error:', error);
      res.status(500).json({
        error: 'Failed to calculate EMI',
        message: 'Unable to process EMI calculation'
      });
    }
  }
);

// @route   POST /api/payments/webhook
// @desc    Razorpay webhook endpoint
// @access  Public (validated by signature)
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      // TODO: Validate webhook signature
      // const signature = req.headers['x-razorpay-signature'];
      // const crypto = require('crypto');
      // const expectedSignature = crypto
      //   .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      //   .update(JSON.stringify(req.body))
      //   .digest('hex');
      // 
      // if (signature !== expectedSignature) {
      //   return res.status(400).json({ error: 'Invalid webhook signature' });
      // }

      const event = req.body;

      switch (event.event) {
        case 'payment.captured':
          // Handle successful payment
          break;
        case 'payment.failed':
          // Handle failed payment
          break;
        case 'refund.processed':
          // Handle successful refund
          break;
        default:
          console.log('Unhandled webhook event:', event.event);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  }
);

// @route   GET /api/payments/transactions
// @desc    Get all transactions
// @access  Private
router.get('/transactions/history',
  authenticateToken,
  async (req, res) => {
    try {
      let filter = {};
      if (req.user.role === 'customer') {
        filter.userId = req.userId;
      }

      const transactions = await Transaction.find(filter)
        .populate('propertyId', 'name area')
        .populate('userId', 'firstName lastName email phone')
        .sort({ paymentDate: -1 });

      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Get transactions history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction history'
      });
    }
  }
);

module.exports = router;
