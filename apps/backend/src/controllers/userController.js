const User = require('../models/User');

// Get all instructors (for admin dropdown)
exports.getInstructors = async (req, res, next) => {
  try {
    const instructors = await User.find({
      roles: { $in: ['instructor', 'admin'] },
      verified: true,
    })
      .select('_id name email avatarUrl roles')
      .sort('name');

    res.json({ instructors });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) {
      query.roles = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('_id name email roles verified avatarUrl createdAt')
      .sort('-createdAt')
      .limit(100);

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

