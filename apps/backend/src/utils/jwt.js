const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');
const RefreshToken = require('../models/RefreshToken');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.jwtAccessSecret, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = async (userId, deviceInfo = {}) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshToken.create({
    userId,
    token,
    expiresAt,
    deviceInfo,
  });

  return token;
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtAccessSecret);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({
    token,
    revoked: false,
    expiresAt: { $gt: new Date() },
  });

  return refreshToken;
};

const revokeRefreshToken = async (token, replacedBy = null) => {
  await RefreshToken.updateOne(
    { token },
    { revoked: true, replacedBy }
  );
};

const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany(
    { userId, revoked: false },
    { revoked: true }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};

