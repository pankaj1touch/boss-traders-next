require('dotenv').config();

// Helper function to get first URL from CLIENT_URL (in case of comma-separated values)
const getClientUrl = () => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  
  // Remove any extra whitespace
  let url = clientUrl.trim();
  
  // If comma-separated, take the first one
  if (url.includes(',')) {
    url = url.split(',')[0].trim();
  }
  
  // Remove trailing slash if present
  url = url.replace(/\/+$/, '');
  
  // Validate it's a proper URL format
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.warn(`⚠️  CLIENT_URL "${url}" doesn't start with http:// or https://. Using default.`);
    return 'http://localhost:3000';
  }
  
  return url;
};

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
  clientUrl: getClientUrl(),
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET,
  },
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

 