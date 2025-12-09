require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const User = require('../models/User');

const createDummyCoupons = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin user
    const admin = await User.findOne({ roles: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Create dummy coupons
    const coupons = [
      {
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        minPurchaseAmount: 1000,
        maxDiscountAmount: 500,
        applicableTo: 'all',
        description: 'Get 20% off on all purchases above ₹1000',
        startDate: null,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 100,
        usageCount: 0,
        userLimit: 1,
        isActive: true,
        createdBy: admin._id,
      },
      {
        code: 'FLAT500',
        type: 'fixed',
        value: 500,
        minPurchaseAmount: 2000,
        applicableTo: 'all',
        description: 'Flat ₹500 off on purchases above ₹2000',
        startDate: null,
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        usageLimit: 50,
        usageCount: 0,
        userLimit: 1,
        isActive: true,
        createdBy: admin._id,
      },
      {
        code: 'COURSE30',
        type: 'percentage',
        value: 30,
        minPurchaseAmount: 500,
        maxDiscountAmount: 1000,
        applicableTo: 'courses',
        description: '30% off on all courses',
        startDate: null,
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        usageLimit: null, // Unlimited
        usageCount: 0,
        userLimit: 2,
        isActive: true,
        createdBy: admin._id,
      },
      {
        code: 'BOOK50',
        type: 'percentage',
        value: 50,
        minPurchaseAmount: 1000,
        applicableTo: 'ebooks',
        description: '50% off on all eBooks',
        startDate: null,
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        usageLimit: 200,
        usageCount: 0,
        userLimit: 1,
        isActive: true,
        createdBy: admin._id,
      },
      {
        code: 'WELCOME100',
        type: 'fixed',
        value: 100,
        minPurchaseAmount: 500,
        applicableTo: 'all',
        description: 'Welcome offer: ₹100 off on your first purchase',
        startDate: null,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        usageLimit: 500,
        usageCount: 0,
        userLimit: 1,
        isActive: true,
        createdBy: admin._id,
      },
    ];

    // Check existing coupons and only create new ones
    const existingCodes = await Coupon.find({}).select('code').lean();
    const existingCodeSet = new Set(existingCodes.map(c => c.code));
    
    const newCoupons = coupons.filter(c => !existingCodeSet.has(c.code));
    
    if (newCoupons.length === 0) {
      console.log('✅ All coupons already exist in database');
      const allCoupons = await Coupon.find({ isActive: true }).select('code type value').lean();
      console.log(`\n📋 Active coupons in database (${allCoupons.length}):`);
      allCoupons.forEach((coupon) => {
        console.log(`   - ${coupon.code}: ${coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} off`);
      });
      process.exit(0);
    }

    // Insert only new coupons
    const createdCoupons = await Coupon.insertMany(newCoupons);
    console.log(`✅ Created ${createdCoupons.length} coupons:`);
    createdCoupons.forEach((coupon) => {
      console.log(`   - ${coupon.code}: ${coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} off`);
    });

    console.log('\n🎉 Dummy coupons created successfully!\n');
    console.log('📝 Test these coupons:');
    console.log('   - SAVE20: 20% off (min ₹1000)');
    console.log('   - FLAT500: ₹500 off (min ₹2000)');
    console.log('   - COURSE30: 30% off on courses');
    console.log('   - BOOK50: 50% off on eBooks');
    console.log('   - WELCOME100: ₹100 off (min ₹500)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating coupons:', error);
    process.exit(1);
  }
};

createDummyCoupons();

