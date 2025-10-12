const mongoose = require('mongoose');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailjs');
const config = require('../config/env');
const logger = require('../config/logger');

// Test email functionality
const testEmailFunctionality = async () => {
  try {
    console.log('🚀 Testing Email Functionality...\n');

    // Check if email is configured
    if (!config.email.smtp || !config.email.smtp.user || !config.email.smtp.pass) {
      console.log('❌ Email not configured. Please set SMTP_USER and SMTP_PASS in environment variables.');
      console.log('\n📝 To configure email:');
      console.log('1. Create a Gmail App Password:');
      console.log('   - Go to Google Account Settings');
      console.log('   - Security → 2-Step Verification → App Passwords');
      console.log('   - Generate password for "Mail"');
      console.log('2. Add to your .env file:');
      console.log('   SMTP_USER=your-email@gmail.com');
      console.log('   SMTP_PASS=your_app_password_here');
      return;
    }

    console.log(`📧 Email configured for: ${config.email.smtp.user}`);
    console.log(`🌐 Client URL: ${config.clientUrl}\n`);

    // Test user data
    const testUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: config.email.smtp.user, // Send to yourself for testing
    };

    const testToken = 'test_verification_token_12345';
    const testResetToken = 'test_reset_token_67890';

    console.log('1️⃣ Testing Verification Email...');
    const verificationResult = await sendVerificationEmail(testUser, testToken);
    console.log(verificationResult.success ? '✅ Verification email sent successfully' : '❌ Verification email failed');
    console.log(verificationResult.message || verificationResult.error || '');
    console.log('');

    console.log('2️⃣ Testing Password Reset Email...');
    const resetResult = await sendPasswordResetEmail(testUser, testResetToken);
    console.log(resetResult.success ? '✅ Password reset email sent successfully' : '❌ Password reset email failed');
    console.log(resetResult.message || resetResult.error || '');
    console.log('');

    console.log('3️⃣ Testing Welcome Email...');
    const welcomeResult = await sendWelcomeEmail(testUser);
    console.log(welcomeResult.success ? '✅ Welcome email sent successfully' : '❌ Welcome email failed');
    console.log(welcomeResult.message || welcomeResult.error || '');
    console.log('');

    if (verificationResult.success && resetResult.success && welcomeResult.success) {
      console.log('🎉 All email tests passed! Check your inbox.');
    } else {
      console.log('⚠️  Some email tests failed. Check the error messages above.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test
if (require.main === module) {
  testEmailFunctionality().then(() => {
    console.log('\n✨ Email test completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testEmailFunctionality };
