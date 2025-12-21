const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../config/logger');

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  if (!config.email.smtp || !config.email.smtp.user || !config.email.smtp.pass) {
    logger.warn('Email SMTP not configured. Email functionality disabled.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.pass, // Use App Password for Gmail
      },
      // Add timeout and other options for better error handling
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed:', error.message);
      } else {
        logger.info('Email server is ready to send messages');
      }
    });

    return transporter;
  } catch (error) {
    logger.error('Failed to create email transporter:', error.message);
    return null;
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  console.log('\n📬 === SEND EMAIL FUNCTION CALLED ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Creating transporter...');
  
  const transporter = createTransporter();
  
  if (!transporter) {
    const errorMsg = 'Email not configured. Please set SMTP_USER and SMTP_PASS in .env file. See EMAIL_SETUP_GUIDE.md for instructions.';
    logger.warn(errorMsg);
    console.error('\n⚠️  EMAIL ERROR:', errorMsg);
    console.error('📖 Run: npm run test:email to verify email configuration\n');
    return { success: false, message: 'Email not configured' };
  }
  
  console.log('✅ Transporter created successfully');

  try {
    const mailOptions = {
      from: `"Boss Traders" <${config.email.smtp.user}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    console.log('📨 Mail options prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    console.log('🚀 Attempting to send email...');

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
    logger.info(`Email sent successfully to ${to}: ${subject}`);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('Error details:', error);
    logger.error(`Failed to send email to ${to}:`, error.message);
    console.error('\n❌ EMAIL SEND ERROR:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('Invalid login')) {
      console.error('💡 TIP: Make sure you are using a Gmail App Password, not your regular password.');
      console.error('📖 See EMAIL_SETUP_GUIDE.md for instructions on creating an App Password.\n');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 TIP: Cannot connect to email server. Check your internet connection.\n');
    }
    
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (user, verificationToken) => {
  const verificationLink = `${config.clientUrl}/auth/verify?token=${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Boss Traders</h1>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email Address</h2>
        <p style="color: #475569; line-height: 1.6;">Hello ${user.name},</p>
        <p style="color: #475569; line-height: 1.6;">
          Thank you for signing up with Boss Traders! Please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationLink}" style="color: #2563eb;">${verificationLink}</a>
        </p>
      </div>
      
      <div style="text-align: center; color: #64748b; font-size: 12px;">
        <p>If you didn't create an account with Boss Traders, please ignore this email.</p>
        <p>&copy; 2024 Boss Traders. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
    Verify Your Email Address - Boss Traders
    
    Hello ${user.name},
    
    Thank you for signing up with Boss Traders! Please verify your email address by clicking the link below:
    
    ${verificationLink}
    
    If you didn't create an account with Boss Traders, please ignore this email.
    
    Best regards,
    Boss Traders Team
  `;

  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address - Boss Traders',
    html: html,
    text: text,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  console.log('\n🔍 === PASSWORD RESET EMAIL DEBUG ===');
  console.log('📧 Sending password reset email to:', user.email);
  console.log('👤 User name:', user.name);
  console.log('🔑 Reset token:', resetToken);
  console.log('🌐 Client URL:', config.clientUrl);
  console.log('📮 SMTP User:', config.email.smtp.user || 'NOT CONFIGURED');
  console.log('🔐 SMTP Pass:', config.email.smtp.pass ? '✅ EXISTS (hidden)' : '❌ NOT CONFIGURED');
  
  // Ensure clientUrl is clean (no trailing slash, no commas)
  let cleanClientUrl = config.clientUrl.trim();
  if (cleanClientUrl.includes(',')) {
    cleanClientUrl = cleanClientUrl.split(',')[0].trim();
  }
  cleanClientUrl = cleanClientUrl.replace(/\/+$/, ''); // Remove trailing slashes
  
  const resetLink = `${cleanClientUrl}/auth/reset?token=${resetToken}`;
  console.log('🔗 Reset link generated:', resetLink);
  console.log('🔍 Cleaned Client URL:', cleanClientUrl);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Boss Traders</h1>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #475569; line-height: 1.6;">Hello ${user.name},</p>
        <p style="color: #475569; line-height: 1.6;">
          You requested to reset your password for your Boss Traders account. Click the button below to set a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </div>
        
        <div style="background: #fef2f2; border-left: 4px solid #fca5a5; padding: 15px; margin: 20px 0;">
          <p style="color: #dc2626; margin: 0; font-size: 14px;">
            <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
          </p>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
        </p>
        
        <p style="color: #64748b; font-size: 14px;">
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
      
      <div style="text-align: center; color: #64748b; font-size: 12px;">
        <p>&copy; 2024 Boss Traders. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
    Reset Your Password - Boss Traders
    
    Hello ${user.name},
    
    You requested to reset your password for your Boss Traders account. Click the link below to set a new password:
    
    ${resetLink}
    
    This link will expire in 1 hour for your security.
    
    If you didn't request this password reset, please ignore this email.
    
    Best regards,
    Boss Traders Team
  `;

  console.log('📤 Calling sendEmail function...\n');
  
  const result = await sendEmail({
    to: user.email,
    subject: 'Reset Your Password - Boss Traders',
    html: html,
    text: text,
  });
  
  console.log('✉️ Email send result:', result);
  console.log('=== END PASSWORD RESET EMAIL DEBUG ===\n');
  
  return result;
};

const sendOrderConfirmationEmail = async (user, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Boss Traders</h1>
      </div>
      
      <div style="background: #f0f9ff; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">🎉 Order Confirmation</h2>
        <p style="color: #475569; line-height: 1.6;">Hello ${user.name},</p>
        <p style="color: #475569; line-height: 1.6;">
          Thank you for your order! We're excited to help you on your learning journey.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Order Details</h3>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${order.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ${order.currency} ${order.total}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        
        <p style="color: #475569; line-height: 1.6;">
          Your order is being processed and you'll receive access details shortly.
        </p>
      </div>
      
      <div style="text-align: center; color: #64748b; font-size: 12px;">
        <p>&copy; 2024 Boss Traders. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
    Order Confirmation #${order.orderNumber} - Boss Traders
    
    Hello ${user.name},
    
    Thank you for your order! Your order has been confirmed.
    
    Order Details:
    - Order Number: #${order.orderNumber}
    - Total Amount: ${order.currency} ${order.total}
    - Order Date: ${new Date(order.createdAt).toLocaleDateString()}
    
    Your order is being processed and you'll receive access details shortly.
    
    Best regards,
    Boss Traders Team
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation #${order.orderNumber} - Boss Traders`,
    html: html,
    text: text,
  });
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Boss Traders</h1>
      </div>
      
      <div style="background: #f0f9ff; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">🎉 Welcome to Boss Traders!</h2>
        <p style="color: #475569; line-height: 1.6;">Hello ${user.name},</p>
        <p style="color: #475569; line-height: 1.6;">
          Welcome to Boss Traders! We're thrilled to have you join our community of learners and traders.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">What's Next?</h3>
          <ul style="color: #475569; line-height: 1.8;">
            <li>Explore our courses and start learning</li>
            <li>Join our live trading sessions</li>
            <li>Download our premium ebooks</li>
            <li>Connect with our trading community</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.clientUrl}/courses" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Start Learning Now
          </a>
        </div>
        
        <p style="color: #475569; line-height: 1.6;">
          If you have any questions, feel free to reach out to our support team. We're here to help you succeed!
        </p>
      </div>
      
      <div style="text-align: center; color: #64748b; font-size: 12px;">
        <p>&copy; 2024 Boss Traders. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
    Welcome to Boss Traders!
    
    Hello ${user.name},
    
    Welcome to Boss Traders! We're thrilled to have you join our community of learners and traders.
    
    What's Next?
    - Explore our courses and start learning
    - Join our live trading sessions  
    - Download our premium ebooks
    - Connect with our trading community
    
    Start your learning journey: ${config.clientUrl}/courses
    
    If you have any questions, feel free to reach out to our support team.
    
    Best regards,
    Boss Traders Team
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Boss Traders! 🎉',
    html: html,
    text: text,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendWelcomeEmail,
};