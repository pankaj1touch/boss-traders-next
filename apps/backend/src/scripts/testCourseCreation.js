const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config();

async function testCourseCreation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ roles: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found. Please create admin first.');
      process.exit(1);
    }

    console.log('Found admin user:', admin.email);

    // Test course data
    const testCourseData = {
      title: 'Test React Course',
      slug: 'test-react-course',
      category: 'programming',
      price: 999,
      language: 'English',
      level: 'beginner',
      tags: ['react', 'javascript'],
      description: 'This is a test course for React development',
      outcomes: ['Learn React basics', 'Build real apps'],
      prerequisites: ['HTML knowledge', 'CSS basics'],
      modality: 'recorded',
      publishStatus: 'draft',
      instructorId: admin._id,
    };

    console.log('Creating test course...');
    const course = await Course.create(testCourseData);
    console.log('✅ Course created successfully!');
    console.log('Course ID:', course._id);
    console.log('Course Title:', course.title);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test course:', error);
    process.exit(1);
  }
}

testCourseCreation();














