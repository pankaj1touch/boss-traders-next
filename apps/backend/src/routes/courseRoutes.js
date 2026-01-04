const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createCourseSchema,
  updateCourseSchema,
  enrollCourseSchema,
} = require('../validators/courseValidators');

// Public routes
router.get('/', optionalAuth, courseController.getAllCourses);
router.get('/:slug', optionalAuth, courseController.getCourseBySlug);

// Authenticated routes
router.post('/:id/enroll', authenticate, validate(enrollCourseSchema), courseController.enrollInCourse);
router.get('/:id/videos', optionalAuth, courseController.getCourseVideos);
router.get('/:id/progress', authenticate, courseController.getCourseProgress);
router.post('/:id/videos/:videoId/progress', authenticate, courseController.updateVideoProgress);

// Video Comments
router.get('/:id/videos/:videoId/comments', optionalAuth, courseController.getVideoComments);
router.post('/:id/videos/:videoId/comments', authenticate, courseController.createVideoComment);
router.patch('/comments/:commentId', authenticate, courseController.updateVideoComment);
router.delete('/comments/:commentId', authenticate, courseController.deleteVideoComment);
router.post('/comments/:commentId/like', authenticate, courseController.toggleCommentLike);

// Video Notes & Bookmarks
router.get('/:id/videos/:videoId/notes', authenticate, courseController.getVideoNotes);
router.get('/:id/notes', authenticate, courseController.getVideoNotes);
router.post('/:id/videos/:videoId/notes', authenticate, courseController.createVideoNote);
router.patch('/notes/:noteId', authenticate, courseController.updateVideoNote);
router.delete('/notes/:noteId', authenticate, courseController.deleteVideoNote);
router.get('/:id/bookmarks', authenticate, courseController.getBookmarks);

// Video Favorites
router.post('/:id/videos/:videoId/favorite', authenticate, courseController.toggleVideoFavorite);
router.get('/:id/videos/:videoId/favorite', authenticate, courseController.checkVideoFavorite);
router.get('/favorites/all', authenticate, courseController.getVideoFavorites);

// Video Ratings
router.post('/:id/videos/:videoId/rate', authenticate, courseController.rateVideo);
router.get('/:id/videos/:videoId/ratings', optionalAuth, courseController.getVideoRatings);

// Video History
router.get('/history/all', authenticate, courseController.getVideoHistory);

// Video Subtitles
router.get('/:id/videos/:videoId/subtitles', optionalAuth, courseController.getVideoSubtitles);
router.post('/:id/videos/:videoId/subtitles', authenticate, authorize('instructor', 'admin'), courseController.createVideoSubtitle);
router.patch('/subtitles/:subtitleId', authenticate, authorize('instructor', 'admin'), courseController.updateVideoSubtitle);
router.delete('/subtitles/:subtitleId', authenticate, authorize('instructor', 'admin'), courseController.deleteVideoSubtitle);

// Video Playlists
router.post('/playlists', authenticate, courseController.createPlaylist);
router.get('/playlists', authenticate, courseController.getPlaylists);
router.get('/playlists/:playlistId', optionalAuth, courseController.getPlaylist);
router.patch('/playlists/:playlistId', authenticate, courseController.updatePlaylist);
router.delete('/playlists/:playlistId', authenticate, courseController.deletePlaylist);
router.post('/playlists/:playlistId/videos', authenticate, courseController.addVideoToPlaylist);
router.delete('/playlists/:playlistId/videos/:videoIndex', authenticate, courseController.removeVideoFromPlaylist);
router.patch('/playlists/:playlistId/reorder', authenticate, courseController.reorderPlaylistVideos);

// Video Quizzes
router.get('/:id/videos/:videoId/quiz', optionalAuth, courseController.getVideoQuiz);
router.post('/:id/videos/:videoId/quiz/attempt', authenticate, courseController.submitQuizAttempt);
router.post('/:id/videos/:videoId/quiz', authenticate, authorize('instructor', 'admin'), courseController.createVideoQuiz);
router.patch('/quizzes/:quizId', authenticate, authorize('instructor', 'admin'), courseController.updateVideoQuiz);
router.delete('/quizzes/:quizId', authenticate, authorize('instructor', 'admin'), courseController.deleteVideoQuiz);

// Certificates
router.post('/:id/certificate', authenticate, courseController.generateCertificate);
router.get('/certificates/all', authenticate, courseController.getUserCertificates);
router.get('/certificates/:certificateId', optionalAuth, courseController.getCertificate);
router.get('/certificates/verify', courseController.verifyCertificate);

// Video Recommendations
router.get('/recommendations', optionalAuth, courseController.getRecommendedVideos);
router.get('/:id/videos/:videoId/related', optionalAuth, courseController.getRelatedVideos);

// Video Download
router.get('/:id/videos/:videoId/download', authenticate, courseController.getVideoDownloadUrl);

// Video Transcription
router.get('/:id/videos/:videoId/transcription', optionalAuth, courseController.getVideoTranscription);
router.post('/:id/videos/:videoId/transcription', authenticate, authorize('instructor', 'admin'), courseController.createVideoTranscription);
router.patch('/transcriptions/:transcriptionId', authenticate, authorize('instructor', 'admin'), courseController.updateVideoTranscription);
router.delete('/transcriptions/:transcriptionId', authenticate, authorize('instructor', 'admin'), courseController.deleteVideoTranscription);

// Live Streaming
router.post('/:id/live-streams', authenticate, courseController.createLiveStream);
router.get('/:id/live-streams', optionalAuth, courseController.getLiveStreams);
router.get('/live-streams/:streamId', optionalAuth, courseController.getLiveStream);
router.patch('/live-streams/:streamId', authenticate, courseController.updateLiveStream);
router.delete('/live-streams/:streamId', authenticate, courseController.deleteLiveStream);
router.post('/live-streams/:streamId/start', authenticate, courseController.startLiveStream);
router.post('/live-streams/:streamId/end', authenticate, courseController.endLiveStream);
router.patch('/live-streams/:streamId/viewers', optionalAuth, courseController.updateViewerCount);

// Live Stream Chat
router.get('/live-streams/:streamId/chat', optionalAuth, courseController.getLiveStreamChat);
router.post('/live-streams/:streamId/chat', authenticate, courseController.sendLiveStreamMessage);
router.post('/live-streams/chat/:messageId/like', optionalAuth, courseController.likeLiveStreamMessage);

// Student Analytics
router.get('/analytics/student', authenticate, courseController.getStudentVideoAnalytics);

// Video Annotations
router.post('/:id/videos/:videoId/annotations', authenticate, authorize('instructor', 'admin'), courseController.createVideoAnnotation);
router.get('/:id/videos/:videoId/annotations', optionalAuth, courseController.getVideoAnnotations);
router.patch('/annotations/:annotationId', authenticate, authorize('instructor', 'admin'), courseController.updateVideoAnnotation);
router.delete('/annotations/:annotationId', authenticate, authorize('instructor', 'admin'), courseController.deleteVideoAnnotation);

// Course Discussions/Forums
router.post('/:id/discussions', authenticate, courseController.createCourseDiscussion);
router.get('/:id/discussions', optionalAuth, courseController.getCourseDiscussions);
router.get('/discussions/:discussionId', optionalAuth, courseController.getCourseDiscussion);
router.patch('/discussions/:discussionId', authenticate, courseController.updateCourseDiscussion);
router.delete('/discussions/:discussionId', authenticate, courseController.deleteCourseDiscussion);
router.post('/discussions/:discussionId/replies', authenticate, courseController.addDiscussionReply);
router.patch('/discussions/:discussionId/replies/:replyIndex', authenticate, courseController.updateDiscussionReply);
router.delete('/discussions/:discussionId/replies/:replyIndex', authenticate, courseController.deleteDiscussionReply);
router.post('/discussions/:discussionId/like', optionalAuth, courseController.likeDiscussion);
router.post('/discussions/:discussionId/replies/:replyIndex/like', optionalAuth, courseController.likeDiscussionReply);
router.post('/discussions/:discussionId/replies/:replyIndex/solution', authenticate, courseController.markReplyAsSolution);

// Video Annotations
router.post('/:id/videos/:videoId/annotations', authenticate, authorize('instructor', 'admin'), courseController.createVideoAnnotation);
router.get('/:id/videos/:videoId/annotations', optionalAuth, courseController.getVideoAnnotations);
router.patch('/annotations/:annotationId', authenticate, authorize('instructor', 'admin'), courseController.updateVideoAnnotation);
router.delete('/annotations/:annotationId', authenticate, authorize('instructor', 'admin'), courseController.deleteVideoAnnotation);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), courseController.adminGetAllCourses);
router.get('/admin/:id', authenticate, authorize('admin'), courseController.adminGetCourseById);
router.get('/admin/:id/videos/analytics', authenticate, authorize('admin'), courseController.getVideoAnalytics);
router.post('/', authenticate, authorize('instructor', 'admin'), validate(createCourseSchema), courseController.createCourse);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), validate(updateCourseSchema), courseController.updateCourse);
router.delete('/:id', authenticate, authorize('admin'), courseController.deleteCourse);

module.exports = router;

