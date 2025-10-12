require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGODB_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  email: {
    smtp: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

// Validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not defined in environment variables`);
    process.exit(1);
  }
});

module.exports = config;

