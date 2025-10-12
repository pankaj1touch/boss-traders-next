#!/usr/bin/env node

/**
 * Interactive Email Setup Script for Boss Traders Backend
 * Run this script to configure email settings
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const setupEmail = async () => {
  console.log('\n📧 Boss Traders Email Setup Wizard\n');
  console.log('This wizard will help you configure email for password reset functionality.\n');

  // Check if .env already exists
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, 'env.example');
  
  let existingEnv = '';
  if (fs.existsSync(envPath)) {
    console.log('✅ Found existing .env file\n');
    existingEnv = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env from env.example\n');
    existingEnv = fs.readFileSync(envExamplePath, 'utf8');
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📖 Gmail App Password Setup Instructions:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('1. Go to: https://myaccount.google.com/security');
  console.log('2. Enable "2-Step Verification" if not already enabled');
  console.log('3. Search for "App Passwords" in settings');
  console.log('4. Select "Mail" and generate a password');
  console.log('5. Copy the 16-character password');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const email = await question('Enter your Gmail address: ');
  const appPassword = await question('Enter your Gmail App Password: ');

  // Update or create .env
  let updatedEnv = existingEnv;

  // Update SMTP_USER
  if (updatedEnv.includes('SMTP_USER=')) {
    updatedEnv = updatedEnv.replace(/SMTP_USER=.*/g, `SMTP_USER=${email}`);
  } else {
    updatedEnv += `\nSMTP_USER=${email}`;
  }

  // Update SMTP_PASS
  if (updatedEnv.includes('SMTP_PASS=')) {
    updatedEnv = updatedEnv.replace(/SMTP_PASS=.*/g, `SMTP_PASS=${appPassword}`);
  } else {
    updatedEnv += `\nSMTP_PASS=${appPassword}`;
  }

  // Write to .env
  fs.writeFileSync(envPath, updatedEnv.trim() + '\n');

  console.log('\n✅ Email configuration saved to .env file\n');
  console.log('Next steps:');
  console.log('1. Test email: npm run test:email');
  console.log('2. Restart backend: npm run dev');
  console.log('3. Try forgot password feature\n');

  const testNow = await question('Would you like to test email now? (yes/no): ');
  
  if (testNow.toLowerCase() === 'yes' || testNow.toLowerCase() === 'y') {
    console.log('\n🧪 Testing email configuration...\n');
    
    rl.close();
    
    // Run test email script
    require('./src/scripts/testEmail');
  } else {
    console.log('\n✨ Setup complete! Run "npm run test:email" to test later.\n');
    rl.close();
  }
};

// Run setup
setupEmail().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});


