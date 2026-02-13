require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdminUsers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // --- Create Super Admin ---
    const superAdminEmail = 'superadmin@realtyadmin.com';
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (existingSuperAdmin) {
      console.log('ℹ️  Super Admin user already exists');
      if (existingSuperAdmin.role !== 'super_admin') {
        existingSuperAdmin.role = 'super_admin';
        await existingSuperAdmin.save();
        console.log('✅ User upgraded to super_admin role');
      }
    } else {
      const superAdminUser = new User({
        email: superAdminEmail,
        password: 'superadmin@1234',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '8888888888',
        role: 'super_admin',
        isActive: true,
        isVerified: true
      });
      await superAdminUser.save();
      console.log('✅ Super Admin user created successfully!');
    }

    // --- Create Regular Admin ---
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@realtyengage.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      if (existingAdmin.role !== 'admin' && existingAdmin.role !== 'super_admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ User upgraded to admin role');
      }
    } else {
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
    }

    console.log('');
    console.log('📋 Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:', superAdminEmail, '/ superadmin@1234');
    console.log('Regular Admin:', adminEmail, '/ (check .env)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin users:', error.message);
    process.exit(1);
  }
};

createAdminUsers();
