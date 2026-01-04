require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const SocialLink = require('../models/SocialLink');
const User = require('../models/User');
const connectDB = require('../config/db');

const defaultLinks = [
  {
    platform: 'facebook',
    url: 'https://facebook.com/bosstraders',
    isActive: true,
    order: 0,
  },
  {
    platform: 'twitter',
    url: 'https://twitter.com/bosstraders',
    isActive: true,
    order: 1,
  },
  {
    platform: 'linkedin',
    url: 'https://linkedin.com/company/bosstraders',
    isActive: true,
    order: 2,
  },
  {
    platform: 'instagram',
    url: 'https://instagram.com/bosstraders',
    isActive: true,
    order: 3,
  },
];

async function seedSocialLinks() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get admin user for lastUpdatedBy
    const adminUser = await User.findOne({ roles: { $in: ['admin'] } });
    if (!adminUser) {
      console.log('Warning: No admin user found. Creating links without lastUpdatedBy.');
    }

    let created = 0;
    let skipped = 0;

    for (const linkData of defaultLinks) {
      try {
        const existing = await SocialLink.findOne({ platform: linkData.platform });

        if (existing) {
          console.log(`Social link for "${linkData.platform}" already exists. Skipping...`);
          skipped++;
          continue;
        }

        const socialLink = new SocialLink({
          ...linkData,
          lastUpdatedBy: adminUser?._id,
        });

        await socialLink.save();
        console.log(`✅ Created social link for "${linkData.platform}"`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating social link for "${linkData.platform}":`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log('\n✅ Social links seeding completed!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding social links:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedSocialLinks();
}

module.exports = { seedSocialLinks };

