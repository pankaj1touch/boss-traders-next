const AWS = require('aws-sdk');
const config = require('../config/env');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);
const s3 = new AWS.S3();

/**
 * Generate thumbnail from video using ffmpeg
 * @param {string} videoUrl - S3 video URL or local path
 * @param {number} timestamp - Timestamp in seconds (default: 1 second)
 * @param {string} outputPath - Output path for thumbnail
 * @returns {Promise<string>} - Thumbnail file path
 */
async function generateThumbnail(videoUrl, timestamp = 1, outputPath = null) {
  try {
    // Check if ffmpeg is available
    try {
      await execAsync('ffmpeg -version');
    } catch (error) {
      console.warn('⚠️  ffmpeg is not installed. Thumbnail generation skipped.');
      return null;
    }

    // If videoUrl is S3 URL, download it first
    let localVideoPath = videoUrl;
    if (videoUrl.includes('s3') || videoUrl.includes('amazonaws.com')) {
      // Extract key from S3 URL
      const url = new URL(videoUrl);
      const key = url.pathname.substring(1);

      // Download video to temp location
      const tempDir = path.join(__dirname, '../../temp');
      await fs.mkdir(tempDir, { recursive: true });
      localVideoPath = path.join(tempDir, `temp_${Date.now()}.mp4`);

      const videoData = await s3
        .getObject({
          Bucket: config.aws.s3Bucket,
          Key: key,
        })
        .promise();

      await fs.writeFile(localVideoPath, videoData.Body);
    }

    // Generate output path if not provided
    if (!outputPath) {
      const tempDir = path.join(__dirname, '../../temp');
      await fs.mkdir(tempDir, { recursive: true });
      outputPath = path.join(tempDir, `thumbnail_${Date.now()}.jpg`);
    }

    // Generate thumbnail using ffmpeg
    await execAsync(
      `ffmpeg -i "${localVideoPath}" -ss ${timestamp} -vframes 1 -q:v 2 "${outputPath}"`
    );

    // Clean up temp video if downloaded
    if (localVideoPath !== videoUrl && localVideoPath.includes('temp_')) {
      await fs.unlink(localVideoPath).catch(() => {});
    }

    return outputPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
}

/**
 * Upload thumbnail to S3
 * @param {string} thumbnailPath - Local thumbnail file path
 * @param {string} folder - S3 folder path (e.g., 'courses')
 * @returns {Promise<string>} - S3 URL of uploaded thumbnail
 */
async function uploadThumbnailToS3(thumbnailPath, folder = 'courses') {
  try {
    const fileContent = await fs.readFile(thumbnailPath);
    const fileName = `thumbnails/${folder}/${Date.now()}-${path.basename(thumbnailPath)}`;

    const uploadResult = await s3
      .upload({
        Bucket: config.aws.s3Bucket,
        Key: fileName,
        Body: fileContent,
        ContentType: 'image/jpeg',
      })
      .promise();

    // Clean up local file
    await fs.unlink(thumbnailPath).catch(() => {});

    return uploadResult.Location;
  } catch (error) {
    console.error('Error uploading thumbnail to S3:', error);
    return null;
  }
}

/**
 * Generate and upload thumbnail from video
 * @param {string} videoUrl - Video URL
 * @param {number} timestamp - Timestamp in seconds
 * @param {string} folder - S3 folder
 * @returns {Promise<string|null>} - Thumbnail URL or null
 */
async function generateAndUploadThumbnail(videoUrl, timestamp = 1, folder = 'courses') {
  try {
    const thumbnailPath = await generateThumbnail(videoUrl, timestamp);
    if (!thumbnailPath) {
      return null;
    }

    const thumbnailUrl = await uploadThumbnailToS3(thumbnailPath, folder);
    return thumbnailUrl;
  } catch (error) {
    console.error('Error in generateAndUploadThumbnail:', error);
    return null;
  }
}

/**
 * Generate multiple thumbnails at different timestamps
 * @param {string} videoUrl - Video URL
 * @param {number[]} timestamps - Array of timestamps
 * @param {string} folder - S3 folder
 * @returns {Promise<string[]>} - Array of thumbnail URLs
 */
async function generateMultipleThumbnails(videoUrl, timestamps = [1, 10, 30], folder = 'courses') {
  try {
    const thumbnailUrls = await Promise.all(
      timestamps.map((timestamp) => generateAndUploadThumbnail(videoUrl, timestamp, folder))
    );

    return thumbnailUrls.filter((url) => url !== null);
  } catch (error) {
    console.error('Error generating multiple thumbnails:', error);
    return [];
  }
}

module.exports = {
  generateThumbnail,
  uploadThumbnailToS3,
  generateAndUploadThumbnail,
  generateMultipleThumbnails,
};


