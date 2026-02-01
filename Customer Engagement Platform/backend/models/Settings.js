const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    general: {
        appName: {
            type: String,
            default: 'Customer Engagement Platform'
        },
        logo: String,
        darkModeEnabled: {
            type: Boolean,
            default: false
        },
        brandColors: {
            primary: { type: String, default: '#4f46e5' }, // Indigo-600
            secondary: { type: String, default: '#64748b' } // Slate-500
        },
        contactEmail: String,
        supportPhone: String
    },
    property: {
        categories: [{
            type: String
        }],
        statusTypes: [{
            type: String,
            enum: ['Upcoming', 'Ready', 'Sold']
        }],
        defaultVisibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public'
        },
        enquiryExpiryDays: {
            type: Number,
            default: 30
        }
    },
    payment: {
        enabled: {
            type: Boolean,
            default: true
        },
        allowEMI: {
            type: Boolean,
            default: true
        },
        defaultEMIMonths: {
            type: Number,
            default: 12
        },
        isLiveMode: {
            type: Boolean,
            default: false
        },
        gateway: {
            type: String,
            enum: ['stripe', 'razorpay'],
            default: 'stripe'
        }
    },
    notification: {
        emailEnabled: {
            type: Boolean,
            default: true
        },
        whatsappEnabled: {
            type: Boolean,
            default: false
        },
        adminAlerts: {
            newEnquiry: { type: Boolean, default: true }
        }
    },
    // Future-ready
    roles: {
        adminPermissions: [String],
        staffRoles: [String]
    }
}, {
    timestamps: true
});

// Singleton pattern: ensure only one settings document exists
settingsSchema.statics.getInstance = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({
        property: {
            categories: ['Residential', 'Commercial'],
            statusTypes: ['Upcoming', 'Ready', 'Sold']
        }
    });
};

module.exports = mongoose.model('Settings', settingsSchema);
