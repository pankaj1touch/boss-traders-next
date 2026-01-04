require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const PageContent = require('../models/PageContent');
const User = require('../models/User');
const connectDB = require('../config/db');

const defaultContent = {
  about: {
    pageType: 'about',
    title: 'About Boss Traders Investor Class',
    content: `
      <h2>Welcome to Boss Traders Investor Class</h2>
      <p>We are a premier educational platform dedicated to empowering traders and investors with the knowledge, skills, and strategies needed to succeed in the financial markets.</p>
      
      <h3>Our Mission</h3>
      <p>Our mission is to democratize financial education and make professional trading knowledge accessible to everyone. We believe that with the right guidance and training, anyone can learn to trade and invest successfully.</p>
      
      <h3>What We Offer</h3>
      <ul>
        <li><strong>Comprehensive Courses:</strong> Learn from industry experts with our structured course curriculum</li>
        <li><strong>Live Trading Sessions:</strong> Watch and learn from real-time trading sessions</li>
        <li><strong>Expert Guidance:</strong> Get personalized mentorship from experienced traders</li>
        <li><strong>Community Support:</strong> Join a vibrant community of traders and investors</li>
      </ul>
      
      <h3>Why Choose Us?</h3>
      <p>With years of experience in the financial markets, our team of expert instructors brings real-world knowledge and proven strategies to help you navigate the complexities of trading and investing.</p>
      
      <p>Join thousands of successful traders who have transformed their financial future with Boss Traders Investor Class.</p>
    `,
    metaTitle: 'About Us | Boss Traders Investor Class',
    metaDescription: 'Learn about Boss Traders Investor Class and our mission to empower traders and investors with premium education and expert guidance.',
    isActive: true,
  },
  contact: {
    pageType: 'contact',
    title: 'Contact Us',
    content: `
      <h2>Get in Touch</h2>
      <p>We'd love to hear from you! Whether you have questions about our courses, need support, or want to learn more about our services, our team is here to help.</p>
      
      <h3>Contact Information</h3>
      <div style="margin: 20px 0;">
        <p><strong>Email:</strong> info@bosstradersinvestorclass.com</p>
        <p><strong>Phone:</strong> +91 92292 55662</p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/919229255662" target="_blank">+91 92292 55662</a></p>
      </div>
      
      <h3>Office Hours</h3>
      <p>Monday - Friday: 9:00 AM - 6:00 PM IST<br>
      Saturday: 10:00 AM - 4:00 PM IST<br>
      Sunday: Closed</p>
      
      <h3>Follow Us</h3>
      <p>Stay connected with us on social media for the latest updates, trading tips, and market insights.</p>
      
      <p>For course inquiries, enrollment, or technical support, please reach out to us through any of the channels above. We typically respond within 24 hours.</p>
    `,
    metaTitle: 'Contact Us | Boss Traders Investor Class',
    metaDescription: 'Get in touch with Boss Traders Investor Class. Contact us for course inquiries, support, or to learn more about our trading education services.',
    isActive: true,
  },
  careers: {
    pageType: 'careers',
    title: 'Join Our Team',
    content: `
      <h2>Build Your Career with Boss Traders Investor Class</h2>
      <p>We're always looking for passionate, talented individuals to join our growing team. If you're excited about financial education and want to make a difference in people's lives, we'd love to hear from you.</p>
      
      <h3>Why Work With Us?</h3>
      <ul>
        <li><strong>Impact:</strong> Help thousands of people achieve their financial goals</li>
        <li><strong>Growth:</strong> Continuous learning and professional development opportunities</li>
        <li><strong>Innovation:</strong> Work with cutting-edge technology and teaching methods</li>
        <li><strong>Culture:</strong> Collaborative, supportive, and inclusive work environment</li>
      </ul>
      
      <h3>Open Positions</h3>
      <p>We're currently looking for:</p>
      <ul>
        <li>Trading Instructors & Content Creators</li>
        <li>Marketing & Growth Specialists</li>
        <li>Customer Success Managers</li>
        <li>Technical Support Engineers</li>
      </ul>
      
      <h3>How to Apply</h3>
      <p>If you're interested in joining our team, please send your resume and a cover letter to:</p>
      <p><strong>Email:</strong> careers@bosstradersinvestorclass.com</p>
      
      <p>We review all applications and will get back to qualified candidates within 2-3 business days.</p>
      
      <p><em>Boss Traders Investor Class is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.</em></p>
    `,
    metaTitle: 'Careers | Boss Traders Investor Class',
    metaDescription: 'Join Boss Traders Investor Class team. Explore career opportunities in trading education, content creation, and customer success.',
    isActive: true,
  },
};

async function seedPageContent() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get admin user for lastUpdatedBy
    const adminUser = await User.findOne({ roles: { $in: ['admin'] } });
    if (!adminUser) {
      console.log('Warning: No admin user found. Creating content without lastUpdatedBy.');
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const [pageType, content] of Object.entries(defaultContent)) {
      try {
        const existing = await PageContent.findOne({ pageType });

        if (existing) {
          console.log(`Page content for "${pageType}" already exists. Skipping...`);
          skipped++;
          continue;
        }

        const pageContent = new PageContent({
          ...content,
          lastUpdatedBy: adminUser?._id,
        });

        await pageContent.save();
        console.log(`✅ Created page content for "${pageType}"`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating page content for "${pageType}":`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log('\n✅ Page content seeding completed!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding page content:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedPageContent();
}

module.exports = { seedPageContent };

