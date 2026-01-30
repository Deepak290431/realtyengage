const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const supportRoutes = require('./routes/supportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const createApp = (type = 'customer') => {
    const app = express();

    // Database connection
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realtyengage', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => console.log(`[${type.toUpperCase()}] MongoDB connected successfully`))
        .catch((err) => console.error(`[${type.toUpperCase()}] MongoDB connection error:`, err));

    // Security middleware
    app.use(helmet());

    // CORS configuration
    const allowedOrigins = [
        'http://localhost:5173', // Customer
        'http://localhost:5174', // Admin
        /^http:\/\/localhost:\d+$/
    ];

    app.use(cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            const isAllowed = allowedOrigins.some(allowedOrigin => {
                if (typeof allowedOrigin === 'string') return origin === allowedOrigin;
                return allowedOrigin.test(origin);
            });
            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000, // Higher limit for dev
        message: 'Too many requests, please try again later.'
    });
    app.use('/api/', limiter);

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    app.use(compression());

    // Logging
    if (process.env.NODE_ENV !== 'production') {
        app.use(morgan('dev'));
    }

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/enquiries', enquiryRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/support', supportRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/chatbot', chatbotRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
        res.status(200).json({ status: 'OK', type });
    });

    return app;
};

module.exports = createApp;
