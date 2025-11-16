const Enrollment = require('../models/Enrollment');
const Order = require('../models/Order');
const LiveSession = require('../models/LiveSession');
const Ebook = require('../models/Ebook');

const mapCourseResponse = (enrollment) => {
  if (!enrollment.courseId) {
    return null;
  }

  const course = enrollment.courseId;
  return {
    enrollmentId: enrollment._id,
    progress: enrollment.progress,
    accessTier: enrollment.accessTier,
    status: enrollment.status,
    enrolledAt: enrollment.createdAt,
    course: {
      _id: course._id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      level: course.level,
      category: course.category,
      rating: course.rating,
      ratingCount: course.ratingCount,
      language: course.language,
    },
  };
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [courseIds, totalOrders, ordersWithItems] = await Promise.all([
      Enrollment.find({ userId, status: { $ne: 'cancelled' } }).distinct('courseId'),
      Order.countDocuments({ userId }),
      Order.find({ userId, status: 'completed' }).select('items'),
    ]);

    const ebookIds = new Set();
    ordersWithItems.forEach((order) => {
      order.items.forEach((item) => {
        if (item.ebookId) {
          ebookIds.add(item.ebookId.toString());
        }
      });
    });

    const [enrolledCourses, activeLiveSessions] = await Promise.all([
      Enrollment.countDocuments({ userId, status: 'active' }),
      courseIds.length
        ? LiveSession.countDocuments({
            courseId: { $in: courseIds },
            status: { $in: ['scheduled', 'live'] },
          })
        : 0,
    ]);

    res.json({
      stats: {
        enrolledCourses,
        ebooks: ebookIds.size,
        liveSessions: activeLiveSessions,
        totalOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyCourses = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({ userId, status: { $ne: 'cancelled' } })
      .populate('courseId', 'title slug thumbnail level category rating ratingCount language')
      .sort('-createdAt');

    const courses = enrollments
      .map(mapCourseResponse)
      .filter((course) => course !== null);

    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

exports.getMyEbooks = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({
      userId,
      status: 'completed',
      'items.ebookId': { $exists: true },
    })
      .select('items createdAt')
      .sort('-createdAt');

    const ebookMap = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.ebookId) {
          const key = item.ebookId.toString();
          if (!ebookMap.has(key)) {
            ebookMap.set(key, {
              price: item.price,
              purchasedAt: order.createdAt,
            });
          }
        }
      });
    });

    const ebookIds = Array.from(ebookMap.keys());
    const ebooksData = ebookIds.length
      ? await Ebook.find({ _id: { $in: ebookIds } }).select('title author cover price format pages')
      : [];

    const ebooks = ebooksData.map((ebook) => {
      const meta = ebookMap.get(ebook._id.toString());
      return {
        _id: ebook._id,
        title: ebook.title,
        author: ebook.author,
        cover: ebook.cover,
        price: meta?.price ?? ebook.price,
        format: ebook.format,
        pages: ebook.pages,
        purchasedAt: meta?.purchasedAt,
      };
    });

    res.json({ ebooks });
  } catch (error) {
    next(error);
  }
};

