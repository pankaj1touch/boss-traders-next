const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boss-traders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestUser = async () => {
  try {
    const testEmail = 'pankajtouch07@gmail.com';
    
    console.log('🔍 Checking if user already exists...\n');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: testEmail });
    
    if (existingUser) {
      console.log('✅ User already exists:');
      console.log(`   Name:  ${existingUser.name}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   ID:    ${existingUser._id}`);
      console.log('\n💡 You can use this email for testing forgot password!\n');
      process.exit(0);
    }
    
    console.log('📝 Creating test user...\n');
    
    // Create new user
    const user = await User.create({
      name: 'Pankaj Singh',
      email: testEmail,
      phone: '9876543210',
      passwordHash: 'Test@123',
      verified: true,
      roles: ['student'],
    });
    
    console.log('✅ Test user created successfully!\n');
    console.log('═'.repeat(60));
    console.log('👤 User Details:');
    console.log(`   Name:     ${user.name}`);
    console.log(`   Email:    ${user.email}`);
    console.log(`   Password: Test@123`);
    console.log(`   Phone:    ${user.phone}`);
    console.log(`   Verified: ${user.verified ? 'Yes ✅' : 'No ❌'}`);
    console.log('═'.repeat(60));
    console.log('\n📧 Now you can test forgot password with this email!\n');
    console.log('Steps:');
    console.log('1. Go to: http://localhost:3000/auth/forgot');
    console.log(`2. Enter email: ${testEmail}`);
    console.log('3. Check your Gmail inbox\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
};

// Run the script
createTestUser();

