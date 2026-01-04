const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config/env');

// Debug AWS configuration
console.log('🔧 AWS Configuration Check:');
console.log('   - Access Key ID:', config.aws.accessKeyId ? `${config.aws.accessKeyId.substring(0, 8)}...` : 'NOT SET');
console.log('   - Secret Access Key:', config.aws.secretAccessKey ? 'SET' : 'NOT SET');
console.log('   - Region:', config.aws.region);
console.log('   - S3 Bucket:', config.aws.s3Bucket);

// Validate AWS configuration
if (!config.aws.accessKeyId || !config.aws.secretAccessKey || !config.aws.s3Bucket) {
  console.error('❌ AWS configuration is incomplete. Please check:');
  console.error('   - AWS_ACCESS_KEY_ID:', config.aws.accessKeyId ? 'SET' : 'NOT SET');
  console.error('   - AWS_SECRET_ACCESS_KEY:', config.aws.secretAccessKey ? 'SET' : 'NOT SET');
  console.error('   - AWS_S3_BUCKET:', config.aws.s3Bucket ? 'SET' : 'NOT SET');
  throw new Error('AWS configuration incomplete');
}

// Configure AWS
AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

const s3 = new AWS.S3();

// Create upload configuration with dynamic folder and file type
const createUploadConfig = (folder = 'blog', fileType = 'image') => {
  const limits = {
    image: 5 * 1024 * 1024, // 5MB for images
    video: 500 * 1024 * 1024, // 500MB for videos
    file: 100 * 1024 * 1024, // 100MB for files
  };

  const fileFilters = {
    image: (file) => file.mimetype.startsWith('image/'),
    video: (file) => file.mimetype.startsWith('video/'),
    file: (file) => {
      const allowedTypes = [
        'application/pdf',
        'application/epub+zip',
        'application/x-mobipocket-ebook',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/');
    }
  };

  return multer({
    storage: multerS3({
      s3: s3,
      bucket: config.aws.s3Bucket,
      // Remove ACL for modern S3 buckets that don't allow ACLs
      // Public access should be managed via bucket policy
      key: function (req, file, cb) {
        // Generate unique filename with timestamp and folder
        const timestamp = Date.now();
        const folderPath = fileType === 'image' ? `images/${folder}` : 
                          fileType === 'video' ? `videos/${folder}` : 
                          `files/${folder}`;
        const filename = `${folderPath}/${timestamp}-${file.originalname}`;
        cb(null, filename);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname, fileType: fileType });
      },
    }),
    limits: {
      fileSize: limits[fileType] || limits.file,
    },
    fileFilter: (req, file, cb) => {
      const filter = fileFilters[fileType];
      if (filter && filter(file)) {
        cb(null, true);
      } else {
        cb(new Error(`Only ${fileType} files are allowed!`), false);
      }
    },
  });
};

// Default upload configuration (for blogs)
const upload = createUploadConfig();

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Create upload middleware with dynamic folder and file type
const createUploadSingleImage = (folder) => {
  return createUploadConfig(folder, 'image').single('image');
};

// Create upload middleware for videos
const createUploadSingleVideo = (folder) => {
  return createUploadConfig(folder, 'video').single('video');
};

// Create upload middleware for files
const createUploadSingleFile = (folder) => {
  return createUploadConfig(folder, 'file').single('file');
};

// Helper function to delete image from S3
const deleteImageFromS3 = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('s3')) return;

    // Extract key from S3 URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    await s3
      .deleteObject({
        Bucket: config.aws.s3Bucket,
        Key: key,
      })
      .promise();

    console.log(`Successfully deleted image: ${key}`);
  } catch (error) {
    console.error('Error deleting image from S3:', error);
  }
};

/**
 * Generate a signed URL for S3 video access
 * @param {string} videoUrl - The S3 video URL
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {string} Signed URL with time-limited access
 */
const getSignedVideoUrl = (videoUrl, expiresIn = 3600) => {
  try {
    if (!videoUrl) return null;

    // If URL is not an S3 URL, return as-is (might be CDN or external URL)
    if (!videoUrl.includes('s3') && !videoUrl.includes('amazonaws.com')) {
      return videoUrl;
    }

    // Extract key from S3 URL
    let key;
    try {
      const url = new URL(videoUrl);
      key = url.pathname.substring(1); // Remove leading slash
    } catch (e) {
      // If URL parsing fails, try to extract key from path
      const match = videoUrl.match(/videos\/[^\/]+\/(.+)$/);
      if (match) {
        key = match[1];
      } else {
        console.error('Could not extract S3 key from URL:', videoUrl);
        return videoUrl; // Return original URL if extraction fails
      }
    }

    // Generate signed URL
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Expires: expiresIn, // 1 hour default
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    // Return original URL if signing fails
    return videoUrl;
  }
};

/**
 * Generate signed URLs for multiple videos
 * @param {Array} videos - Array of video objects with videoUrl
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Array} Videos with signed URLs
 */
const getSignedVideoUrls = (videos, expiresIn = 3600) => {
  if (!Array.isArray(videos)) return videos;

  return videos.map((video) => {
    if (video.videoUrl) {
      return {
        ...video,
        videoUrl: getSignedVideoUrl(video.videoUrl, expiresIn),
      };
    }
    return video;
  });
};

module.exports = {
  uploadSingleImage,
  createUploadSingleImage,
  createUploadSingleVideo,
  createUploadSingleFile,
  deleteImageFromS3,
  getSignedVideoUrl,
  getSignedVideoUrls,
  s3,
};
