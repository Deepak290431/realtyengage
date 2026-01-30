require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@realtyengage.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password: Use the password from .env (DEFAULT_ADMIN_PASSWORD)');

      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ User upgraded to admin role');
      }
    } else {
      // Create new admin user
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';

      const adminUser = new User({
        email: adminEmail,
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '9999999999',
        role: 'admin',
        isActive: true,
        isVerified: true
      });

      await adminUser.save();

      console.log('✅ Admin user created successfully!');
      console.log('');
      console.log('📋 Admin Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('⚠️  IMPORTANT: Change this password after first login!');
    }

    console.log('');
    console.log('🚀 You can now login at: http://localhost:4000/login');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
