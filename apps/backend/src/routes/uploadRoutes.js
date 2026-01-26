const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  uploadSingleImage, 
  createUploadSingleImage, 
  createUploadSingleVideo, 
  createUploadSingleFile 
} = require('../utils/s3Upload');
const { generateAndUploadThumbnail } = require('../utils/videoThumbnail');

// Test route to check if upload endpoint is accessible
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upload endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// Upload image route
router.post('/image', authenticate, (req, res, next) => {
  console.log('📤 Image upload request received');
  console.log('Headers:', req.headers);
  next();
}, (req, res) => {
  console.log('📁 Starting file upload...');
  console.log('Request body keys:', Object.keys(req.body || {}));
  console.log('Content-Type:', req.headers['content-type']);
  
  // Determine folder based on query parameter or referer
  let folder = 'blog'; // default
  if (req.query.type) {
    folder = req.query.type; // e.g., ?type=courses, ?type=ebooks
  } else if (req.headers.referer) {
    // Try to determine from referer URL
    if (req.headers.referer.includes('/admin/courses')) {
      folder = 'courses';
    } else if (req.headers.referer.includes('/admin/ebooks')) {
      folder = 'ebooks';
    } else if (req.headers.referer.includes('/admin/blogs')) {
      folder = 'blog';
    }
  }
  
  console.log('📁 Upload folder:', folder);
  
  // Create upload middleware with appropriate folder
  const uploadMiddleware = folder === 'blog' ? uploadSingleImage : createUploadSingleImage(folder);
  
  uploadMiddleware(req, res, (error) => {
    console.log('📁 Upload callback triggered');
    console.log('Error:', error);
    console.log('File:', req.file);
    
    if (error) {
      console.error('❌ Upload error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Handle specific AWS S3 errors
      if (error.code === 'NoSuchBucket') {
        return res.status(500).json({
          success: false,
          message: 'S3 bucket not found. Please check bucket configuration.',
          details: 'BUCKET_NOT_FOUND'
        });
      }
      
      if (error.code === 'InvalidAccessKeyId' || error.code === 'SignatureDoesNotMatch') {
        return res.status(500).json({
          success: false,
          message: 'AWS credentials invalid. Please check configuration.',
          details: 'AWS_CREDENTIALS_ERROR'
        });
      }
      
      // Handle ACL not supported error
      if (error.code === 'AccessControlListNotSupported' || error.message.includes('does not allow ACLs')) {
        return res.status(500).json({
          success: false,
          message: 'S3 bucket does not allow ACLs. Please configure bucket policy for public access.',
          details: 'ACL_NOT_SUPPORTED'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Error uploading image',
        details: error.code || 'UNKNOWN_ERROR'
      });
    }

    if (!req.file) {
      console.error('❌ No file received');
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    console.log('✅ Upload successful:', {
      location: req.file.location,
      key: req.file.key,
      size: req.file.size
    });

    // Return the uploaded file information
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: req.file.location,
      fileName: req.file.key,
    });
  });
});

// Upload video route
router.post('/video', authenticate, (req, res, next) => {
  console.log('📤 Video upload request received');
  console.log('Headers:', req.headers);
  next();
}, (req, res) => {
  console.log('📁 Starting video upload...');
  console.log('Request body keys:', Object.keys(req.body || {}));
  console.log('Content-Type:', req.headers['content-type']);
  
  // Determine folder based on query parameter or referer
  let folder = 'courses'; // default for videos
  if (req.query.type) {
    folder = req.query.type;
  } else if (req.headers.referer) {
    if (req.headers.referer.includes('/admin/courses')) {
      folder = 'courses';
    }
  }
  
  console.log('📁 Upload folder:', folder);
  
  // Create upload middleware for videos
  const uploadMiddleware = createUploadSingleVideo(folder);
  
  uploadMiddleware(req, res, (error) => {
    console.log('📁 Video upload callback triggered');
    console.log('Error:', error);
    console.log('File:', req.file);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    if (error) {
      console.error('❌ Video upload error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      
      // More specific error messages
      let errorMessage = error.message || 'Error uploading video';
      let statusCode = 400;
      
      if (error.code === 'LIMIT_FILE_SIZE') {
        errorMessage = 'File size exceeds maximum limit of 500MB';
        statusCode = 413;
      } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        errorMessage = 'Unexpected file field. Please use the correct field name.';
      } else if (error.message?.includes('Only video')) {
        errorMessage = 'Invalid file type. Only video files are allowed (MP4, WebM, OGG, MOV, AVI, MKV).';
      }
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        details: error.code || 'UNKNOWN_ERROR',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (!req.file) {
      console.error('❌ No video file received');
      console.log('Request keys:', Object.keys(req));
      console.log('Files object:', req.files);
      return res.status(400).json({
        success: false,
        message: 'No video file provided. Please select a video file to upload.',
        details: 'FILE_MISSING'
      });
    }

    console.log('✅ Video upload successful:', {
      location: req.file.location,
      key: req.file.key,
      size: req.file.size
    });

    // Optionally generate thumbnail (async, don't wait)
    if (req.query.generateThumbnail === 'true') {
      generateAndUploadThumbnail(req.file.location, 1, folder)
        .then((thumbnailUrl) => {
          if (thumbnailUrl) {
            console.log('✅ Thumbnail generated:', thumbnailUrl);
          }
        })
        .catch((error) => {
          console.error('❌ Thumbnail generation failed:', error);
        });
    }

    // Return the uploaded file information
    res.json({
      success: true,
      message: 'Video uploaded successfully',
      videoUrl: req.file.location,
      fileName: req.file.key,
      fileSize: req.file.size,
    });
  });
});

// Generate thumbnail from video URL
router.post('/video/thumbnail', authenticate, async (req, res) => {
  try {
    const { videoUrl, timestamp = 1, folder = 'courses' } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Video URL is required',
      });
    }

    const thumbnailUrl = await generateAndUploadThumbnail(videoUrl, timestamp, folder);

    if (!thumbnailUrl) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate thumbnail. Make sure ffmpeg is installed.',
      });
    }

    res.json({
      success: true,
      message: 'Thumbnail generated successfully',
      thumbnailUrl,
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating thumbnail',
    });
  }
});

// Upload file route (for ebooks)
router.post('/file', authenticate, (req, res, next) => {
  console.log('📤 File upload request received');
  console.log('Headers:', req.headers);
  next();
}, (req, res) => {
  console.log('📁 Starting file upload...');
  console.log('Request body keys:', Object.keys(req.body || {}));
  console.log('Content-Type:', req.headers['content-type']);
  
  // Determine folder based on query parameter or referer
  let folder = 'ebooks'; // default for files
  if (req.query.type) {
    folder = req.query.type;
  } else if (req.headers.referer) {
    if (req.headers.referer.includes('/admin/ebooks')) {
      folder = 'ebooks';
    }
  }
  
  console.log('📁 Upload folder:', folder);
  
  // Create upload middleware for files
  const uploadMiddleware = createUploadSingleFile(folder);
  
  uploadMiddleware(req, res, (error) => {
    console.log('📁 File upload callback triggered');
    console.log('Error:', error);
    console.log('File:', req.file);
    
    if (error) {
      console.error('❌ File upload error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Error uploading file',
        details: error.code || 'UNKNOWN_ERROR'
      });
    }

    if (!req.file) {
      console.error('❌ No file received');
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    console.log('✅ File upload successful:', {
      location: req.file.location,
      key: req.file.key,
      size: req.file.size
    });

    // Return the uploaded file information
    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: req.file.location,
      fileName: req.file.key,
      fileSize: req.file.size,
    });
  });
});

module.exports = router;
