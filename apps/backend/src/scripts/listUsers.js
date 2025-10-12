const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boss-traders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const listUsers = async () => {
  try {
    console.log('🔍 Fetching all users from database...\n');
    
    const users = await User.find({}, 'name email phone roles createdAt verified').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\n💡 TIP: Create a user first by signing up at http://localhost:3000/auth/signup\n');
      process.exit(0);
    }
    
    console.log(`✅ Found ${users.length} user(s):\n`);
    console.log('═'.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   Name:       ${user.name}`);
      console.log(`   Email:      ${user.email} ${user.verified ? '✅' : '❌ (not verified)'}`);
      console.log(`   Phone:      ${user.phone || 'N/A'}`);
      console.log(`   Roles:      ${user.roles.join(', ')}`);
      console.log(`   Created:    ${user.createdAt.toLocaleString()}`);
    });
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 To test forgot password, use one of the emails listed above.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    process.exit(1);
  }
};

// Run the script
listUsers();

