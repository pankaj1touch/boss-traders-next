const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bosstraders.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', adminEmail);
      
      // Update roles if not admin
      if (!existingAdmin.roles.includes('admin')) {
        existingAdmin.roles.push('admin');
        await existingAdmin.save();
        console.log('Admin role added to existing user');
      }
    } else {
      // Create new admin user
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash: adminPassword, // Will be hashed by pre-save hook
        roles: ['admin', 'student'],
        verified: true,
      });

      console.log('Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();













