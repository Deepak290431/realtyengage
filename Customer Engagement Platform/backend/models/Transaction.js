const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    propertyName: {
        type: String,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'cash', 'bank_transfer'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refund'],
        default: 'pending'
    },
    installmentType: {
        type: String,
        enum: ['full', 'emi', 'down_payment'],
        required: true
    },
    installmentNumber: {
        type: Number,
        default: 1
    },
    commissionAmount: {
        type: Number,
        required: true
    },
    gstAmount: {
        type: Number,
        required: true
    },
    gstRate: {
        type: Number,
        default: 18
    },
    gstType: {
        type: String,
        enum: ['inclusive', 'exclusive'],
        default: 'exclusive'
    },
    ownerPayout: {
        type: Number,
        required: true
    },
    penaltyAmount: {
        type: Number,
        default: 0
    },
    isLatePayment: {
        type: Boolean,
        default: false
    },
    paymentDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
transactionSchema.index({ userId: 1 });
transactionSchema.index({ propertyId: 1 });
transactionSchema.index({ paymentStatus: 1 });
transactionSchema.index({ paymentDate: -1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
