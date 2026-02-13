const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
fs.appendFileSync('server_startup.log', 'Core requires done\n');
const Project = require('./models/Project');
const User = require('./models/User');
fs.appendFileSync('server_startup.log', 'Models required done\n');

// Auto-seeder function
const seedInitialData = async () => {
  try {
    const Project = require('./models/Project');
    const User = require('./models/User');

    // Find any user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) admin = await User.findOne();
    if (!admin) return;

    const coimbatoreProjects = [
      {
        name: 'Kovai Greens',
        description: 'Kovai Greens is a premium gated community plot project in RS Puram.',
        shortDescription: 'Premium gated community plots in RS Puram.',
        area: 'RS Puram, Coimbatore',
        status: 'in_progress',
        type: 'Plot',
        pricing: { basePrice: 5500000, pricePerSqFt: 4500 },
        location: { address: 'RS Puram, Coimbatore', latitude: 11.0089, longitude: 76.9467 },
        images: [{ url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', isPrimary: true }],
        amenities: [{ name: 'Landscape Garden', icon: 'Trees' }],
        configurations: [{ type: 'Plot', area: '1200 sqft', price: '55 Lakhs', available: 10 }],
        createdBy: admin._id,
        isActive: true
      },
      {
        name: 'Peedampalli Estates',
        description: 'Luxurious villas in Peedampalli with private pools.',
        shortDescription: 'Elite villas in Coimbatore.',
        area: 'Peedampalli, Coimbatore',
        status: 'upcoming',
        type: 'Villa',
        pricing: { basePrice: 12000000, pricePerSqFt: 5200 },
        location: { address: 'Sulur, Coimbatore', latitude: 10.9856, longitude: 77.0852 },
        images: [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', isPrimary: true }],
        amenities: [{ name: 'Private Pool', icon: 'Waves' }],
        configurations: [{ type: '3 BHK Villa', area: '2600 sqft', price: '1.2 Crore', available: 5 }],
        createdBy: admin._id,
        isActive: true
      },
      {
        name: 'Siruvani Heights',
        description: 'High-rise apartments on Avinashi Road.',
        shortDescription: 'Modern apartments in Peelamedu.',
        area: 'Avinashi Road, Coimbatore',
        status: 'in_progress',
        type: 'Apartment',
        pricing: { basePrice: 8500000, pricePerSqFt: 6500 },
        location: { address: 'Avinashi Road, Coimbatore', latitude: 11.0253, longitude: 77.0024 },
        images: [{ url: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800', isPrimary: true }],
        amenities: [{ name: 'Rooftop Cafe', icon: 'Building2' }],
        configurations: [{ type: '2 BHK', area: '1350 sqft', price: '85 Lakhs', available: 8 }],
        createdBy: admin._id,
        isActive: true
      }
    ];

    for (const p of coimbatoreProjects) {
      const result = await Project.findOneAndUpdate(
        { name: p.name },
        { ...p, createdBy: admin._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✅ Seeded/Updated: ${p.name} (ID: ${result._id})`);
    }
    console.log('✅ Coimbatore projects seeded/updated');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
};

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const supportRoutes = require('./routes/supportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

// DB Connection - trigger seeding after connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realtyengage')
  .then(() => {
    fs.appendFileSync('server_startup.log', 'MongoDB connected\n');
    seedInitialData();
  })
  .catch((err) => {
    fs.appendFileSync('server_startup.log', 'MongoDB error: ' + err.message + '\n');
    console.error(' MongoDB connection error:', err);
  });

app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // Simplified cors for debug
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes
fs.appendFileSync('server_startup.log', 'Mounting API routes...\n');
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
fs.appendFileSync('server_startup.log', 'Mounting Customer and Settings routes...\n');
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/virtual-tour', require('./routes/virtualTourRoutes'));
app.use('/api/chatbot', chatbotRoutes);
console.log('Mounting /api/contact route...');
app.use('/api/contact', require('./routes/contactRoutes'));
fs.appendFileSync('server_startup.log', 'Routes mounted.\n');

app.get('/api/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.get('/', (req, res) => res.json({ message: 'Welcome to RealtyEngage API' }));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  fs.appendFileSync('server_startup.log', 'Server listening on ' + PORT + '\n');
  console.log(`🚀 Server running on port ${PORT}`);
});
