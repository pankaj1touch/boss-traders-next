require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const LiveSession = require('../models/LiveSession');
const Batch = require('../models/Batch');
const Location = require('../models/Location');
const Ebook = require('../models/Ebook');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await LiveSession.deleteMany({});
    await Batch.deleteMany({});
    await Location.deleteMany({});
    await Ebook.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@edtech.com',
      passwordHash: hashedPassword,
      roles: ['admin', 'instructor'],
      verified: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    });

    const instructor = await User.create({
      name: 'John Instructor',
      email: 'instructor@edtech.com',
      passwordHash: hashedPassword,
      roles: ['instructor'],
      verified: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    });

    const student = await User.create({
      name: 'Jane Student',
      email: 'student@edtech.com',
      passwordHash: hashedPassword,
      roles: ['student'],
      verified: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
    });

    console.log('✅ Created users');

    // Create locations
    const location1 = await Location.create({
      name: 'Downtown Campus',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
      },
      timezone: 'America/New_York',
      capacity: 50,
      facilities: ['WiFi', 'Projector', 'Whiteboard', 'AC'],
      isActive: true,
    });

    const location2 = await Location.create({
      name: 'Tech Hub',
      address: {
        street: '456 Tech Ave',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94102',
      },
      timezone: 'America/Los_Angeles',
      capacity: 30,
      facilities: ['WiFi', 'Computers', 'Coffee Bar'],
      isActive: true,
    });

    console.log('✅ Created locations');

    // Create courses
    const courses = [
      {
        title: 'Complete Web Development Bootcamp',
        slug: 'complete-web-development-bootcamp',
        category: 'programming',
        price: 1,
        salePrice: 1,
        language: 'English',
        level: 'beginner',
        tags: ['web development', 'html', 'css', 'javascript', 'react'],
        thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800',
        description:
          'Master web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack developer.',
        outcomes: [
          'Build responsive websites',
          'Master React and modern JavaScript',
          'Create full-stack applications',
          'Deploy applications to production',
        ],
        prerequisites: ['Basic computer skills', 'No programming experience required'],
        modality: 'hybrid',
        publishStatus: 'published',
        rating: 4.8,
        ratingCount: 245,
        instructorId: instructor._id,
      },
      {
        title: 'Data Science & Machine Learning Masterclass',
        slug: 'data-science-machine-learning-masterclass',
        category: 'data-science',
        price: 1,
        language: 'English',
        level: 'intermediate',
        tags: ['data science', 'machine learning', 'python', 'tensorflow', 'pandas'],
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        description:
          'Become a data scientist. Learn Python, statistics, machine learning, deep learning, and data visualization. Work on industry projects.',
        outcomes: [
          'Master Python for data science',
          'Build machine learning models',
          'Analyze and visualize data',
          'Work on real industry projects',
        ],
        prerequisites: ['Basic Python knowledge', 'High school mathematics'],
        modality: 'recorded',
        publishStatus: 'published',
        rating: 4.9,
        ratingCount: 189,
        instructorId: admin._id,
      },
      {
        title: 'UI/UX Design Fundamentals',
        slug: 'ui-ux-design-fundamentals',
        category: 'design',
        price: 1,
        salePrice: 1,
        language: 'English',
        level: 'beginner',
        tags: ['ui design', 'ux design', 'figma', 'prototyping', 'design thinking'],
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        description:
          'Learn the fundamentals of UI/UX design. Master Figma, design thinking, prototyping, and user research. Create beautiful, user-centered designs.',
        outcomes: [
          'Create stunning UI designs',
          'Master Figma and design tools',
          'Conduct user research',
          'Build interactive prototypes',
        ],
        prerequisites: ['No design experience required', 'Creative mindset'],
        modality: 'live',
        publishStatus: 'published',
        rating: 4.7,
        ratingCount: 156,
        instructorId: instructor._id,
      },
      {
        title: 'Digital Marketing Masterclass',
        slug: 'digital-marketing-masterclass',
        category: 'marketing',
        price: 1,
        language: 'English',
        level: 'beginner',
        tags: ['digital marketing', 'seo', 'social media', 'content marketing', 'analytics'],
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        description:
          'Master digital marketing strategies. Learn SEO, social media marketing, content marketing, email marketing, and analytics.',
        outcomes: [
          'Create effective marketing campaigns',
          'Master SEO and content marketing',
          'Grow social media presence',
          'Analyze marketing metrics',
        ],
        prerequisites: ['No marketing experience required', 'Basic internet skills'],
        modality: 'hybrid',
        publishStatus: 'published',
        rating: 4.6,
        ratingCount: 203,
        instructorId: admin._id,
      },
      {
        title: 'Business Strategy & Management',
        slug: 'business-strategy-management',
        category: 'business',
        price: 1,
        salePrice: 1,
        language: 'English',
        level: 'advanced',
        tags: ['business strategy', 'management', 'leadership', 'entrepreneurship'],
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        description:
          'Develop strategic thinking and management skills. Learn business strategy, leadership, operations management, and entrepreneurship.',
        outcomes: [
          'Develop business strategies',
          'Lead and manage teams',
          'Make data-driven decisions',
          'Launch and grow businesses',
        ],
        prerequisites: ['Some business experience recommended', 'Managerial interest'],
        modality: 'recorded',
        publishStatus: 'published',
        rating: 4.8,
        ratingCount: 134,
        instructorId: instructor._id,
      },
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log('✅ Created courses');

    // Create modules and lessons for first course
    const webDevCourse = createdCourses[0];

    const module1 = await Module.create({
      courseId: webDevCourse._id,
      title: 'Introduction to Web Development',
      description: 'Get started with web development basics',
      order: 1,
    });

    const module2 = await Module.create({
      courseId: webDevCourse._id,
      title: 'HTML & CSS Fundamentals',
      description: 'Master the building blocks of the web',
      order: 2,
    });

    const module3 = await Module.create({
      courseId: webDevCourse._id,
      title: 'JavaScript Essentials',
      description: 'Learn programming with JavaScript',
      order: 3,
    });

    await Lesson.insertMany([
      {
        courseId: webDevCourse._id,
        moduleId: module1._id,
        title: 'Welcome to the Course',
        description: 'Course overview and what you will learn',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationMins: 10,
        order: 1,
        isFree: true,
      },
      {
        courseId: webDevCourse._id,
        moduleId: module1._id,
        title: 'Setting Up Your Development Environment',
        description: 'Install necessary tools and editors',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationMins: 20,
        order: 2,
        isFree: true,
      },
      {
        courseId: webDevCourse._id,
        moduleId: module2._id,
        title: 'HTML Basics',
        description: 'Learn HTML tags and structure',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationMins: 30,
        order: 3,
      },
      {
        courseId: webDevCourse._id,
        moduleId: module2._id,
        title: 'CSS Styling',
        description: 'Style your web pages with CSS',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationMins: 45,
        order: 4,
      },
      {
        courseId: webDevCourse._id,
        moduleId: module3._id,
        title: 'JavaScript Variables and Data Types',
        description: 'Understanding JavaScript basics',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationMins: 40,
        order: 5,
      },
    ]);

    console.log('✅ Created modules and lessons');

    // Create batches
    const batch1 = await Batch.create({
      courseId: webDevCourse._id,
      locationId: location1._id,
      name: 'Web Dev Bootcamp - Fall 2024',
      capacity: 30,
      enrolled: 15,
      rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      instructorId: instructor._id,
      status: 'ongoing',
    });

    const batch2 = await Batch.create({
      courseId: createdCourses[2]._id,
      locationId: location2._id,
      name: 'UI/UX Design - Winter 2024',
      capacity: 20,
      enrolled: 8,
      rrule: 'FREQ=WEEKLY;BYDAY=TU,TH',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-02-28'),
      instructorId: instructor._id,
      status: 'upcoming',
    });

    console.log('✅ Created batches');

    // Create live sessions
    await LiveSession.insertMany([
      {
        courseId: webDevCourse._id,
        batchId: batch1._id,
        title: 'Introduction to React',
        description: 'Live session on React fundamentals',
        startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        attendeeLink: 'https://meet.example.com/session-1',
        hostLink: 'https://meet.example.com/host-session-1',
        status: 'scheduled',
        maxAttendees: 30,
      },
      {
        courseId: createdCourses[2]._id,
        batchId: batch2._id,
        title: 'Design Thinking Workshop',
        description: 'Interactive workshop on design thinking',
        startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        attendeeLink: 'https://meet.example.com/session-2',
        hostLink: 'https://meet.example.com/host-session-2',
        status: 'scheduled',
        maxAttendees: 20,
      },
      {
        courseId: webDevCourse._id,
        batchId: batch1._id,
        title: 'Node.js and Express',
        description: 'Backend development with Node.js',
        startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        attendeeLink: 'https://meet.example.com/session-3',
        hostLink: 'https://meet.example.com/host-session-3',
        status: 'scheduled',
        maxAttendees: 30,
      },
    ]);

    console.log('✅ Created live sessions');

    // Create ebooks
    await Ebook.insertMany([
      {
        title: 'JavaScript: The Definitive Guide',
        slug: 'javascript-the-definitive-guide',
        author: 'David Flanagan',
        cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
        description:
          'The comprehensive guide to JavaScript programming. Master the language that powers the modern web.',
        price: 1,
        salePrice: 1,
        fileUrl: 'https://example.com/files/javascript-guide.pdf',
        fileSize: 15728640,
        pages: 687,
        format: 'pdf',
        drmLevel: 'basic',
        category: 'programming',
        tags: ['javascript', 'programming', 'web development'],
        publishStatus: 'published',
        rating: 4.7,
        ratingCount: 89,
      },
      {
        title: 'Design Patterns for Modern Applications',
        slug: 'design-patterns-for-modern-applications',
        author: 'Sarah Chen',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        description:
          'Learn essential design patterns and architectural principles for building scalable applications.',
        price: 1,
        fileUrl: 'https://example.com/files/design-patterns.pdf',
        fileSize: 20971520,
        pages: 512,
        format: 'pdf',
        drmLevel: 'basic',
        category: 'programming',
        tags: ['design patterns', 'architecture', 'software engineering'],
        publishStatus: 'published',
        rating: 4.8,
        ratingCount: 67,
      },
      {
        title: 'The Data Science Handbook',
        slug: 'the-data-science-handbook',
        author: 'Michael Rodriguez',
        cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
        description:
          'Complete guide to data science, machine learning, and statistical analysis with Python.',
        price: 1,
        salePrice: 1,
        fileUrl: 'https://example.com/files/data-science-handbook.pdf',
        fileSize: 31457280,
        pages: 824,
        format: 'pdf',
        drmLevel: 'advanced',
        category: 'data-science',
        tags: ['data science', 'machine learning', 'python', 'statistics'],
        publishStatus: 'published',
        rating: 4.9,
        ratingCount: 124,
      },
      {
        title: 'UX Research Methods',
        slug: 'ux-research-methods',
        author: 'Emily Watson',
        cover: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400',
        description:
          'Practical guide to user experience research methods, usability testing, and user interviews.',
        price: 1,
        fileUrl: 'https://example.com/files/ux-research-methods.pdf',
        fileSize: 12582912,
        pages: 456,
        format: 'pdf',
        drmLevel: 'basic',
        category: 'design',
        tags: ['ux', 'user research', 'usability', 'design'],
        publishStatus: 'published',
        rating: 4.6,
        ratingCount: 52,
      },
    ]);

    console.log('✅ Created ebooks');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Demo Users:');
    console.log('  Admin: admin@edtech.com / password123');
    console.log('  Instructor: instructor@edtech.com / password123');
    console.log('  Student: student@edtech.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

