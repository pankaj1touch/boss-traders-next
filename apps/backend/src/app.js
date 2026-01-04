const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const corsOptions = require('./config/cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimit');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const liveSessionRoutes = require('./routes/liveSessionRoutes');
const orderRoutes = require('./routes/orderRoutes');
const studentRoutes = require('./routes/studentRoutes');
const ebookRoutes = require('./routes/ebookRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const batchRoutes = require('./routes/batchRoutes');
const locationRoutes = require('./routes/locationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const blogRoutes = require('./routes/blogRoutes');
const blogController = require('./controllers/blogController');
const { validateQuery } = require('./middleware/validate');
const { blogQuerySchema } = require('./validators/blogValidators');
const uploadRoutes = require('./routes/uploadRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const demoClassRoutes = require('./routes/demoClassRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const couponRoutes = require('./routes/couponRoutes');
const pageContentRoutes = require('./routes/pageContentRoutes');
const socialLinkRoutes = require('./routes/socialLinkRoutes');

const app = express();




// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
// app.use('/api', generalLimiter); // Commented out for testing

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/live', liveSessionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
// Public blog routes are served twice to ensure compatibility with legacy deployments
// The explicit handlers below prevent regressions if router mounting fails during deployment.
app.get('/api/blogs', validateQuery(blogQuerySchema), blogController.getAllBlogs);
app.get('/api/blogs/related/:slug', blogController.getRelatedBlogs);
app.get('/api/blogs/:slug', blogController.getBlogBySlug);
app.use('/api/blogs', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/demo-classes', demoClassRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/page-content', pageContentRoutes);
app.use('/api/social-links', socialLinkRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;

