const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Project = require('../models/Project');
const Enquiry = require('../models/Enquiry');
const Payment = require('../models/Payment');
const SupportRequest = require('../models/SupportRequest');

// Sample data
const sampleProjects = [
  {
    name: 'Green Valley Villas',
    description: 'Luxurious 3BHK and 4BHK villas with world-class amenities in a serene environment.',
    shortDescription: 'Premium villas with modern amenities',
    area: 'Whitefield, Bangalore',
    status: 'in_progress',
    specifications: [
      { type: 'Bedrooms', value: '3-4 BHK' },
      { type: 'Area', value: '2400-3200 sqft' },
      { type: 'Amenity', value: 'Swimming Pool' },
      { type: 'Amenity', value: 'Club House' }
    ],
    pricing: {
      basePrice: 12500000,
      pricePerSqFt: 5200,
      currency: 'INR'
    },
    location: {
      address: 'Whitefield Main Road, Bangalore',
      latitude: 12.9698,
      longitude: 77.7500,
      nearbyLandmarks: ['ITPL', 'Forum Mall', 'Columbia Asia Hospital']
    },
    dimensions: {
      totalArea: 3200,
      builtUpArea: 2800,
      carpetArea: 2400
    },
    availability: {
      totalUnits: 50,
      availableUnits: 32,
      soldUnits: 18
    },
    features: ['Swimming Pool', 'Gym', 'Garden', '24x7 Security', 'Power Backup'],
    isActive: true
  },
  {
    name: 'Skyline Apartments',
    description: 'Modern 2BHK apartments with city views and premium lifestyle amenities.',
    shortDescription: 'Affordable luxury apartments',
    area: 'Electronic City, Bangalore',
    status: 'upcoming',
    specifications: [
      { type: 'Bedrooms', value: '2 BHK' },
      { type: 'Area', value: '1200-1400 sqft' },
      { type: 'Amenity', value: 'Gym' },
      { type: 'Amenity', value: 'Parking' }
    ],
    pricing: {
      basePrice: 6500000,
      pricePerSqFt: 4600,
      currency: 'INR'
    },
    location: {
      address: 'Electronic City Phase 2, Bangalore',
      latitude: 12.8399,
      longitude: 77.6770,
      nearbyLandmarks: ['Infosys Campus', 'Electronic City Metro']
    },
    dimensions: {
      totalArea: 1400,
      builtUpArea: 1250,
      carpetArea: 1100
    },
    availability: {
      totalUnits: 120,
      availableUnits: 120,
      soldUnits: 0
    },
    features: ['Gym', 'Parking', 'Garden', 'Security', 'Lift'],
    isActive: true
  },
  {
    name: 'Heritage Heights',
    description: 'Completed luxury project with premium 3BHK and 4BHK apartments.',
    shortDescription: 'Ready-to-move luxury apartments',
    area: 'Koramangala, Bangalore',
    status: 'completed',
    specifications: [
      { type: 'Bedrooms', value: '3-4 BHK' },
      { type: 'Area', value: '1800-2500 sqft' },
      { type: 'Amenity', value: 'Club House' },
      { type: 'Amenity', value: 'Swimming Pool' }
    ],
    pricing: {
      basePrice: 15000000,
      pricePerSqFt: 8300,
      currency: 'INR'
    },
    location: {
      address: 'Koramangala 4th Block, Bangalore',
      latitude: 12.9352,
      longitude: 77.6245,
      nearbyLandmarks: ['Forum Mall', 'Koramangala Club']
    },
    dimensions: {
      totalArea: 2500,
      builtUpArea: 2200,
      carpetArea: 1900
    },
    availability: {
      totalUnits: 80,
      availableUnits: 12,
      soldUnits: 68
    },
    features: ['Club House', 'Swimming Pool', 'Gym', 'Garden', 'Security', 'Power Backup'],
    isActive: true
  },
  {
    name: 'Kovai Greens',
    description: 'Kovai Greens is a premium gated community plot project in RS Puram. Offering serene living with modern infrastructure.',
    shortDescription: 'Premium gated community plots in RS Puram.',
    area: 'RS Puram, Coimbatore',
    status: 'in_progress',
    type: 'Plot',
    pricing: { basePrice: 5500000, pricePerSqFt: 4500, currency: 'INR' },
    location: { address: 'RS Puram, Coimbatore', latitude: 11.0089, longitude: 76.9467, nearbyLandmarks: ['DB Road', 'Brookefields Mall'] },
    dimensions: { totalArea: 1200, builtUpArea: 0, carpetArea: 1200 },
    availability: { totalUnits: 15, availableUnits: 15, soldUnits: 0 },
    features: ['Gated Community', 'Landscape Garden', '24x7 Security'],
    isActive: true
  },
  {
    name: 'Peedampalli Estates',
    description: 'Luxurious villas nestled in the quiet outskirts of Peedampalli.',
    shortDescription: 'Elite villas with private pools.',
    area: 'Peedampalli, Coimbatore',
    status: 'upcoming',
    type: 'Villa',
    pricing: { basePrice: 12000000, pricePerSqFt: 5200, currency: 'INR' },
    location: { address: 'Sulur Road, Coimbatore', latitude: 10.9856, longitude: 77.0852, nearbyLandmarks: ['Sulur Air Force Station'] },
    dimensions: { totalArea: 2600, builtUpArea: 2400, carpetArea: 2200 },
    availability: { totalUnits: 10, availableUnits: 10, soldUnits: 0 },
    features: ['Private Pool', 'Personal Gym', 'Solar Power'],
    isActive: true
  },
  {
    name: 'Siruvani Heights',
    description: 'High-rise apartments on Avinashi Road with Western Ghats views.',
    shortDescription: 'Modern apartments in Peelamedu.',
    area: 'Avinashi Road, Coimbatore',
    status: 'in_progress',
    type: 'Apartment',
    pricing: { basePrice: 8500000, pricePerSqFt: 6500, currency: 'INR' },
    location: { address: 'Avinashi Road, Peelamedu', latitude: 11.0253, longitude: 77.0024, nearbyLandmarks: ['PSG Tech', 'Fun Republic Mall'] },
    dimensions: { totalArea: 1350, builtUpArea: 1200, carpetArea: 1100 },
    availability: { totalUnits: 25, availableUnits: 25, soldUnits: 0 },
    features: ['Rooftop Cafe', 'Infinity Pool', 'Covered Parking'],
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realtyengage', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Enquiry.deleteMany({}),
      Payment.deleteMany({}),
      SupportRequest.deleteMany({})
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = 'Admin@123456';
    const admin = await User.create({
      email: 'admin@realtyengage.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '9999999999',
      role: 'admin',
      isVerified: true,
      address: {
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India'
      }
    });

    // Create sample customers
    console.log('👥 Creating sample customers...');
    const customerPassword = 'Customer@123';
    const customers = await User.create([
      {
        email: 'john.doe@example.com',
        password: customerPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '9876543210',
        role: 'customer',
        statusType: 'just_enquired',
        isVerified: true,
        address: {
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India'
        }
      },
      {
        email: 'jane.smith@example.com',
        password: customerPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543211',
        role: 'customer',
        statusType: 'paid_initial',
        isVerified: true,
        address: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India'
        }
      },
      {
        email: 'robert.wilson@example.com',
        password: customerPassword,
        firstName: 'Robert',
        lastName: 'Wilson',
        phone: '9876543212',
        role: 'customer',
        statusType: 'emi_customer',
        isVerified: true,
        address: {
          city: 'Delhi',
          state: 'Delhi',
          country: 'India'
        }
      }
    ]);

    // Create projects
    console.log('🏗️  Creating sample projects...');
    const projects = await Project.create(
      sampleProjects.map(project => ({
        ...project,
        createdBy: admin._id,
        images: [
          {
            url: `https://source.unsplash.com/800x600/?${project.name.replace(' ', ',')}`,
            caption: 'Main View',
            isPrimary: true
          },
          {
            url: `https://source.unsplash.com/800x600/?apartment,interior`,
            caption: 'Interior View',
            isPrimary: false
          }
        ]
      }))
    );

    // Create sample enquiries
    console.log('📋 Creating sample enquiries...');
    const enquiries = await Enquiry.create([
      {
        customerId: customers[0]._id,
        projectId: projects[0]._id,
        enquiryType: 'general',
        details: 'I am interested in 3BHK villa. Please share more details.',
        preferredContactMethod: 'email',
        status: 'new',
        priority: 'medium'
      },
      {
        customerId: customers[1]._id,
        projectId: projects[1]._id,
        enquiryType: 'pricing',
        details: 'What are the payment plans available?',
        preferredContactMethod: 'phone',
        status: 'in_progress',
        priority: 'high',
        assignedTo: admin._id
      },
      {
        customerId: customers[2]._id,
        projectId: projects[2]._id,
        enquiryType: 'site_visit',
        details: 'I would like to schedule a site visit this weekend.',
        preferredContactMethod: 'whatsapp',
        status: 'follow_up',
        priority: 'medium',
        assignedTo: admin._id
      }
    ]);

    // Create sample payments
    console.log('💰 Creating sample payments...');
    await Payment.create([
      {
        customerId: customers[1]._id,
        projectId: projects[0]._id,
        amount: 500000,
        paymentType: 'booking',
        method: 'bank_transfer',
        status: 'success',
        receiptNumber: 'REC202401001',
        paidAt: new Date()
      },
      {
        customerId: customers[2]._id,
        projectId: projects[2]._id,
        amount: 1500000,
        paymentType: 'down_payment',
        method: 'card',
        status: 'success',
        receiptNumber: 'REC202401002',
        paidAt: new Date()
      }
    ]);

    // Create sample support requests
    console.log('🎫 Creating sample support requests...');
    await SupportRequest.create([
      {
        customerId: customers[0]._id,
        ticketNumber: 'TKT202401001',
        type: 'technical',
        subject: 'Unable to view project images',
        description: 'The images are not loading on the project page.',
        priority: 'high',
        status: 'open'
      },
      {
        customerId: customers[1]._id,
        ticketNumber: 'TKT202401002',
        type: 'billing',
        subject: 'Payment receipt not received',
        description: 'I made a payment yesterday but have not received the receipt.',
        priority: 'medium',
        status: 'in_review',
        assignedTo: admin._id
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@realtyengage.com / Admin@123456');
    console.log('Customer 1: john.doe@example.com / Customer@123');
    console.log('Customer 2: jane.smith@example.com / Customer@123');
    console.log('Customer 3: robert.wilson@example.com / Customer@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
