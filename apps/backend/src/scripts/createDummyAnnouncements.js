require('dotenv').config();
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

const createDummyAnnouncements = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin user (or create one if doesn't exist)
    let admin = await User.findOne({ roles: 'admin' });
    if (!admin) {
      console.log('⚠️  No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Clear existing announcements (optional - comment out if you want to keep existing)
    // await Announcement.deleteMany({});
    // console.log('🗑️  Cleared existing announcements');

    // Create dummy announcements
    const announcements = [
      {
        title: '🎉 New Course Launch: Advanced Options Trading',
        description: 'Learn advanced options trading strategies from industry experts',
        body: 'We are excited to announce our new course on Advanced Options Trading! Master complex strategies, risk management, and profit maximization techniques. Enroll now and get 20% early bird discount.',
        type: 'course',
        priority: 'high',
        audience: 'all',
        isActive: true,
        status: 'active',
        linkUrl: '/courses',
        linkText: 'View Courses',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        createdBy: admin._id,
      },
      {
        title: '💰 Special Offer: 50% OFF on All Courses - Limited Time!',
        description: 'Get 50% discount on all courses this week only',
        body: 'Don\'t miss this amazing opportunity! Get 50% OFF on all courses including live sessions, recorded videos, and eBooks. Use code SAVE50 at checkout. Offer valid until end of this week.',
        type: 'promotion',
        priority: 'high',
        audience: 'all',
        isActive: true,
        status: 'active',
        linkUrl: '/courses',
        linkText: 'Shop Now',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
        createdBy: admin._id,
      },
      {
        title: '📅 Next Live Session: Market Analysis - Tomorrow 6 PM',
        description: 'Join our live market analysis session tomorrow evening',
        body: 'Join our expert traders for a live market analysis session tomorrow at 6 PM. We\'ll cover current market trends, trading opportunities, and answer your questions in real-time. Don\'t miss out!',
        type: 'educational',
        priority: 'medium',
        audience: 'all',
        isActive: true,
        status: 'active',
        linkUrl: '/live',
        linkText: 'Join Session',
        createdBy: admin._id,
      },
      {
        title: '⚠️ Platform Maintenance: Dec 25, 2 AM - 4 AM',
        description: 'Scheduled maintenance window for system updates',
        body: 'We will be performing scheduled maintenance on December 25th from 2 AM to 4 AM IST. During this time, the platform will be temporarily unavailable. We apologize for any inconvenience.',
        type: 'system',
        priority: 'high',
        audience: 'all',
        isActive: true,
        status: 'active',
        startDate: new Date('2024-12-25T02:00:00'),
        endDate: new Date('2024-12-25T04:00:00'),
        createdBy: admin._id,
      },
      {
        title: '📚 New eBook Available: Complete Trading Guide',
        description: 'Download our comprehensive trading guide eBook',
        body: 'We\'ve just released our comprehensive trading guide eBook covering everything from basics to advanced strategies. Available for download now in PDF format.',
        type: 'general',
        priority: 'low',
        audience: 'students',
        isActive: true,
        status: 'active',
        linkUrl: '/ebooks',
        linkText: 'Download Now',
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
        createdBy: admin._id,
      },
      {
        title: '🎓 Certificate Program Starting Next Month',
        description: 'Enroll in our professional trading certificate program',
        body: 'Our 3-month professional trading certificate program is starting next month. Get certified and boost your career. Limited seats available. Early bird registration open now!',
        type: 'course',
        priority: 'medium',
        audience: 'all',
        isActive: true,
        status: 'active',
        linkUrl: '/courses',
        linkText: 'Learn More',
        createdBy: admin._id,
      },
      {
        title: '💳 New Payment Methods Added',
        description: 'We now accept UPI, Credit Cards, and Net Banking',
        body: 'Good news! We\'ve added multiple payment options including UPI, Credit/Debit Cards, and Net Banking. Enjoy seamless payment experience with secure transactions.',
        type: 'payment',
        priority: 'low',
        audience: 'all',
        isActive: true,
        status: 'active',
        createdBy: admin._id,
      },
    ];

    const createdAnnouncements = await Announcement.insertMany(announcements);
    console.log(`✅ Created ${createdAnnouncements.length} dummy announcements`);

    console.log('\n📢 Announcements created:');
    createdAnnouncements.forEach((ann, index) => {
      console.log(`  ${index + 1}. ${ann.title} (${ann.priority} priority, ${ann.type} type)`);
    });

    console.log('\n🎉 Dummy announcements added successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating dummy announcements:', error);
    process.exit(1);
  }
};

createDummyAnnouncements();

