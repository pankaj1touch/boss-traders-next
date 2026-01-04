import { apiSlice } from './apiSlice';

export interface Course {
  _id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  language: string;
  level: string;
  tags: string[];
  thumbnail?: string;
  description: string;
  outcomes: string[];
  prerequisites: string[];
  modality: string;
  publishStatus: string;
  rating: number;
  ratingCount: number;
  instructorId?: any;
  videos?: Video[];
  totalDuration?: number;
  createdAt: string;
}

export interface CourseDetail extends Course {
  modules: any[];
  lessons: any[];
  feedback: any[];
  isEnrolled: boolean;
  videos?: Video[];
}

export interface VideoQuality {
  quality: '360p' | '480p' | '720p' | '1080p' | 'auto';
  url: string;
}

export interface Video {
  _id?: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration?: number;
  isFree: boolean;
  order: number;
  thumbnail?: string;
  locked?: boolean;
  chapters?: VideoChapter[];
  videoQualities?: VideoQuality[];
}

export interface CourseVideosResponse {
  videos: Video[];
  hasAccess: boolean;
  totalVideos: number;
}

export interface VideoProgress {
  currentTime: number;
  duration: number;
  completed: boolean;
  watchedAt?: string;
  lastUpdated?: string;
}

export interface CourseProgressResponse {
  courseProgress: number;
  videoProgress: Record<string, VideoProgress>;
  completedVideos: string[];
  lastWatchedVideo: string | null;
  totalVideos: number;
  completedCount: number;
}

export interface VideoAnalytics {
  totalViews: number;
  uniqueViewers: number;
  totalWatchTime: number;
  averageWatchTime: number;
  completions: number;
  completionRate: number;
  maxWatchTime: number;
}

export interface VideoWithAnalytics extends Video {
  analytics: VideoAnalytics;
}

export interface VideoAnalyticsResponse {
  videos: VideoWithAnalytics[];
  overallStats: {
    totalVideos: number;
    totalViews: number;
    totalUniqueViewers: number;
    totalCompletions: number;
    averageCompletionRate: number;
    totalWatchTime: number;
    averageEngagement?: number;
  };
  trends?: {
    viewsOverTime?: Array<{
      _id: string;
      views: number;
      uniqueViewers: string[];
    }>;
  };
  timeRange?: string;
}

export interface VideoComment {
  _id: string;
  courseId: string;
  videoId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  content: string;
  timestamp?: number;
  parentCommentId?: string;
  likes: string[];
  isEdited: boolean;
  editedAt?: string;
  isPinned: boolean;
  replies?: VideoComment[];
  replyCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoNote {
  _id: string;
  courseId: string;
  videoId: string;
  userId: string;
  content: string;
  timestamp: number;
  title?: string;
  isBookmark: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoChapter {
  title: string;
  timestamp: number;
  description?: string;
}

export interface VideoFavorite {
  _id: string;
  userId: string;
  courseId: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
  };
  videoId: string;
  createdAt: string;
}

export interface VideoRating {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  courseId: string;
  videoId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface VideoHistoryItem {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    slug: string;
  };
  videoId: string;
  videoTitle: string;
  courseTitle: string;
  courseSlug: string;
  lastWatched: string;
  maxWatchTime: number;
  duration: number;
  completed: boolean;
  views: number;
}

export interface VideoSubtitle {
  _id: string;
  courseId: string;
  videoId: string;
  language: string;
  subtitleUrl: string;
  format: 'srt' | 'vtt' | 'ass';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistVideo {
  courseId: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
  };
  videoId: string;
  order: number;
  addedAt: string;
}

export interface VideoPlaylist {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  description?: string;
  videos: PlaylistVideo[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  _id?: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: QuizOption[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
  timestamp: number;
}

export interface VideoQuiz {
  _id: string;
  courseId: string;
  videoId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  isRequired: boolean;
  allowRetake: boolean;
  timeLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  _id: string;
  userId: string;
  quizId: string;
  courseId: string;
  videoId: string;
  answers: Array<{
    questionId: string;
    answer: any;
    isCorrect: boolean;
    points: number;
  }>;
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface Certificate {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
    slug?: string;
    thumbnail?: string;
    instructor?: string;
  };
  certificateNumber: string;
  issuedAt: string;
  completionDate: string;
  score?: number;
  verificationCode: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence?: number;
}

export interface VideoTranscription {
  _id: string;
  courseId: string;
  videoId: string;
  language: string;
  segments: TranscriptionSegment[];
  fullText?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider: 'manual' | 'aws-transcribe' | 'google-speech' | 'whisper';
  createdAt: string;
  updatedAt: string;
}

export interface VideoAnnotation {
  _id: string;
  courseId: string;
  videoId: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  type: 'marker' | 'annotation' | 'highlight' | 'note';
  timestamp: number;
  title: string;
  content?: string;
  color?: string;
  position?: {
    x: number;
    y: number;
  };
  isVisible: boolean;
  isPublic: boolean;
  attachments?: Array<{
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  content: string;
  likes: number;
  isPinned: boolean;
  isSolution: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDiscussion {
  _id: string;
  courseId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  title: string;
  content: string;
  category: 'general' | 'question' | 'help' | 'feedback' | 'announcement';
  tags: string[];
  views: number;
  likes: number;
  replies: DiscussionReply[];
  isPinned: boolean;
  isLocked: boolean;
  isResolved: boolean;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveStream {
  _id: string;
  courseId: any;
  createdBy: any;
  title?: string;
  description?: string;
  streamUrl?: string;
  recordedVideoUrl?: string;
  scheduledAt?: string;
  status?: string;
  viewers?: number;
  chatEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LiveStreamChatMessage {
  _id: string;
  streamId: string;
  userId: {
    _id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  message: string;
  type?: string;
  likes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoAnnotation {
  _id: string;
  courseId: string;
  videoId: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  type: 'marker' | 'annotation' | 'highlight' | 'note';
  timestamp: number;
  title: string;
  content?: string;
  color?: string;
  position?: {
    x: number;
    y: number;
  };
  isVisible: boolean;
  isPublic: boolean;
  attachments?: Array<{
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<CoursesResponse, any>({
      query: (params) => ({
        url: '/courses',
        params,
      }),
      providesTags: ['Course'],
    }),
    getCourseBySlug: builder.query<{ course: CourseDetail; modules: any[]; lessons: any[]; feedback: any[]; isEnrolled: boolean }, string>({
      query: (slug) => `/courses/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Course', id: slug }],
    }),
    enrollInCourse: builder.mutation<any, { id: string; batchId?: string; accessTier?: string }>({
      query: ({ id, ...body }) => ({
        url: `/courses/${id}/enroll`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course', 'User'],
    }),
    getCourseVideos: builder.query<CourseVideosResponse, string>({
      query: (id) => `/courses/${id}/videos`,
      providesTags: (result, error, id) => [{ type: 'Course', id: `${id}-videos` }],
    }),
    getCourseProgress: builder.query<CourseProgressResponse, string>({
      query: (id) => `/courses/${id}/progress`,
      providesTags: (result, error, id) => [{ type: 'Course', id: `${id}-progress` }],
    }),
    updateVideoProgress: builder.mutation<
      { message: string; progress: VideoProgress; courseProgress: number },
      { courseId: string; videoId: string; currentTime: number; duration: number; completed?: boolean }
    >({
      query: ({ courseId, videoId, ...body }) => ({
        url: `/courses/${courseId}/videos/${videoId}/progress`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Course', id: `${courseId}-progress` },
      ],
    }),
    getVideoAnalytics: builder.query<VideoAnalyticsResponse, string>({
      query: (id) => `/courses/admin/${id}/videos/analytics`,
      providesTags: (result, error, id) => [{ type: 'Course', id: `${id}-analytics` }],
    }),
    getVideoComments: builder.query<{ comments: VideoComment[]; total: number }, { courseId: string; videoId: string }>({
      query: ({ courseId, videoId }) => `/courses/${courseId}/videos/${videoId}/comments`,
      providesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-comments` },
      ],
    }),
    createVideoComment: builder.mutation<
      { message: string; comment: VideoComment },
      { courseId: string; videoId: string; content: string; timestamp?: number; parentCommentId?: string }
    >({
      query: ({ courseId, videoId, ...body }) => ({
        url: `/courses/${courseId}/videos/${videoId}/comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-comments` },
      ],
    }),
    updateVideoComment: builder.mutation<{ message: string; comment: VideoComment }, { commentId: string; content: string }>({
      query: ({ commentId, ...body }) => ({
        url: `/courses/comments/${commentId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { commentId }) => ['Course'],
    }),
    deleteVideoComment: builder.mutation<{ message: string }, string>({
      query: (commentId) => ({
        url: `/courses/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    toggleCommentLike: builder.mutation<
      { message: string; likesCount: number; isLiked: boolean },
      string
    >({
      query: (commentId) => ({
        url: `/courses/comments/${commentId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Course'],
    }),
    getVideoNotes: builder.query<{ notes: VideoNote[]; total: number }, { courseId: string; videoId?: string }>({
      query: ({ courseId, videoId }) => {
        if (videoId) {
          return `/courses/${courseId}/videos/${videoId}/notes`;
        }
        return `/courses/${courseId}/notes`;
      },
      providesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId || 'all'}-notes` },
      ],
    }),
    createVideoNote: builder.mutation<
      { message: string; note: VideoNote },
      { courseId: string; videoId: string; content: string; timestamp: number; title?: string; isBookmark?: boolean; tags?: string[] }
    >({
      query: ({ courseId, videoId, ...body }) => ({
        url: `/courses/${courseId}/videos/${videoId}/notes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-notes` },
      ],
    }),
    updateVideoNote: builder.mutation<
      { message: string; note: VideoNote },
      { noteId: string; content?: string; title?: string; tags?: string[] }
    >({
      query: ({ noteId, ...body }) => ({
        url: `/courses/notes/${noteId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteVideoNote: builder.mutation<{ message: string }, string>({
      query: (noteId) => ({
        url: `/courses/notes/${noteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    getBookmarks: builder.query<{ bookmarks: VideoNote[]; total: number }, string>({
      query: (courseId) => `/courses/${courseId}/bookmarks`,
      providesTags: (result, error, courseId) => [{ type: 'Course', id: `${courseId}-bookmarks` }],
    }),
    toggleVideoFavorite: builder.mutation<
      { message: string; isFavorite: boolean },
      { courseId: string; videoId: string }
    >({
      query: ({ courseId, videoId }) => ({
        url: `/courses/${courseId}/videos/${videoId}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: ['Course'],
    }),
    checkVideoFavorite: builder.query<{ isFavorite: boolean }, { courseId: string; videoId: string }>({
      query: ({ courseId, videoId }) => `/courses/${courseId}/videos/${videoId}/favorite`,
      providesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-favorite` },
      ],
    }),
    getVideoFavorites: builder.query<{ favorites: VideoFavorite[]; total: number }, void>({
      query: () => '/courses/favorites/all',
      providesTags: ['Course'],
    }),
    rateVideo: builder.mutation<
      { message: string; rating: VideoRating; averageRating: number; totalRatings: number },
      { courseId: string; videoId: string; rating: number; review?: string }
    >({
      query: ({ courseId, videoId, ...body }) => ({
        url: `/courses/${courseId}/videos/${videoId}/rate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-ratings` },
      ],
    }),
    getVideoRatings: builder.query<
      { ratings: VideoRating[]; averageRating: number; totalRatings: number; userRating: VideoRating | null },
      { courseId: string; videoId: string }
    >({
      query: ({ courseId, videoId }) => `/courses/${courseId}/videos/${videoId}/ratings`,
      providesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-ratings` },
      ],
    }),
    getVideoHistory: builder.query<{ history: VideoHistoryItem[]; total: number }, void>({
      query: () => '/courses/history/all',
      providesTags: ['Course'],
    }),
    getVideoSubtitles: builder.query<{ subtitles: VideoSubtitle[]; total: number }, { courseId: string; videoId: string }>({
      query: ({ courseId, videoId }) => `/courses/${courseId}/videos/${videoId}/subtitles`,
      providesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-subtitles` },
      ],
    }),
    createVideoSubtitle: builder.mutation<
      { message: string; subtitle: VideoSubtitle },
      { courseId: string; videoId: string; language: string; subtitleUrl: string; format?: string; isDefault?: boolean }
    >({
      query: ({ courseId, videoId, ...body }) => ({
        url: `/courses/${courseId}/videos/${videoId}/subtitles`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-subtitles` },
      ],
    }),
    updateVideoSubtitle: builder.mutation<
      { message: string; subtitle: VideoSubtitle },
      { subtitleId: string; language?: string; subtitleUrl?: string; format?: string; isDefault?: boolean }
    >({
      query: ({ subtitleId, ...body }) => ({
        url: `/courses/subtitles/${subtitleId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteVideoSubtitle: builder.mutation<{ message: string }, string>({
      query: (subtitleId) => ({
        url: `/courses/subtitles/${subtitleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    createPlaylist: builder.mutation<
      { message: string; playlist: VideoPlaylist },
      { title: string; description?: string; isPublic?: boolean }
    >({
      query: (body) => ({
        url: '/courses/playlists',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    getPlaylists: builder.query<{ playlists: VideoPlaylist[]; total: number }, { includePublic?: boolean }>({
      query: (params) => ({
        url: '/courses/playlists',
        params,
      }),
      providesTags: ['Course'],
    }),
    getPlaylist: builder.query<{ playlist: VideoPlaylist }, string>({
      query: (playlistId) => `/courses/playlists/${playlistId}`,
      providesTags: (result, error, playlistId) => [{ type: 'Course', id: `playlist-${playlistId}` }],
    }),
    updatePlaylist: builder.mutation<
      { message: string; playlist: VideoPlaylist },
      { playlistId: string; title?: string; description?: string; isPublic?: boolean }
    >({
      query: ({ playlistId, ...body }) => ({
        url: `/courses/playlists/${playlistId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { playlistId }) => [{ type: 'Course', id: `playlist-${playlistId}` }],
    }),
    deletePlaylist: builder.mutation<{ message: string }, string>({
      query: (playlistId) => ({
        url: `/courses/playlists/${playlistId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    addVideoToPlaylist: builder.mutation<
      { message: string; playlist: VideoPlaylist },
      { playlistId: string; courseId: string; videoId: string }
    >({
      query: ({ playlistId, ...body }) => ({
        url: `/courses/playlists/${playlistId}/videos`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { playlistId }) => [{ type: 'Course', id: `playlist-${playlistId}` }],
    }),
    removeVideoFromPlaylist: builder.mutation<
      { message: string; playlist: VideoPlaylist },
      { playlistId: string; videoIndex: number }
    >({
      query: ({ playlistId, videoIndex }) => ({
        url: `/courses/playlists/${playlistId}/videos/${videoIndex}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { playlistId }) => [{ type: 'Course', id: `playlist-${playlistId}` }],
    }),
    getVideoQuiz: builder.query<
      { quiz: VideoQuiz; previousAttempts: QuizAttempt[]; bestScore: number },
      { courseId: string; videoId: string }
    >({
      query: ({ courseId, videoId }) => `/courses/${courseId}/videos/${videoId}/quiz`,
      providesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-quiz` },
      ],
    }),
    submitQuizAttempt: builder.mutation<
      { message: string; attempt: QuizAttempt },
      { courseId: string; videoId: string; answers: any[]; timeSpent?: number }
    >({
      query: ({ courseId, videoId, ...body }) => ({
        url: `/courses/${courseId}/videos/${videoId}/quiz/attempt`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-quiz` },
      ],
    }),
    createVideoQuiz: builder.mutation<{ message: string; quiz: VideoQuiz }, { courseId: string; videoId: string } & Partial<VideoQuiz>>({
      query: ({ courseId, videoId, ...body }) => ({
        url: `/courses/${courseId}/videos/${videoId}/quiz`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    updateVideoQuiz: builder.mutation<{ message: string; quiz: VideoQuiz }, { quizId: string } & Partial<VideoQuiz>>({
      query: ({ quizId, ...body }) => ({
        url: `/courses/quizzes/${quizId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteVideoQuiz: builder.mutation<{ message: string }, string>({
      query: (quizId) => ({
        url: `/courses/quizzes/${quizId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    generateCertificate: builder.mutation<{ message: string; certificate: Certificate }, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/certificate`,
        method: 'POST',
      }),
      invalidatesTags: ['Course', 'User'],
    }),
    getUserCertificates: builder.query<{ certificates: Certificate[]; total: number }, void>({
      query: () => '/courses/certificates/all',
      providesTags: ['Course', 'User'],
    }),
    getCertificate: builder.query<{ certificate: Certificate }, string>({
      query: (certificateId) => `/courses/certificates/${certificateId}`,
      providesTags: (result, error, certificateId) => [
        { type: 'Course', id: `certificate-${certificateId}` },
      ],
    }),
    verifyCertificate: builder.query<{ valid: boolean; certificate?: any }, { verificationCode: string }>({
      query: (params) => ({
        url: '/courses/certificates/verify',
        params,
      }),
    }),
    getRecommendedVideos: builder.query<{ recommendations: Course[]; type: string }, { limit?: number }>({
      query: (params) => ({
        url: '/courses/recommendations',
        params,
      }),
      providesTags: ['Course'],
    }),
    getRelatedVideos: builder.query<
      { relatedVideos: Array<{ course: Course; video: Video }> },
      { courseId: string; videoId: string; limit?: number }
    >({
      query: ({ courseId, videoId, ...params }) => ({
        url: `/courses/${courseId}/videos/${videoId}/related`,
        params,
      }),
      providesTags: ['Course'],
    }),
    getVideoDownloadUrl: builder.query<
      { downloadUrl: string; expiresIn: number; fileName: string },
      { courseId: string; videoId: string }
    >({
      query: ({ courseId, videoId }) => `/courses/${courseId}/videos/${videoId}/download`,
    }),
    getVideoTranscription: builder.query<
      { transcription: VideoTranscription },
      { courseId: string; videoId: string; language?: string }
    >({
      query: ({ courseId, videoId, ...params }) => ({
        url: `/courses/${courseId}/videos/${videoId}/transcription`,
        params,
      }),
    }),
    createVideoTranscription: builder.mutation<
      { message: string; transcription: VideoTranscription },
      { courseId: string; videoId: string; language?: string; segments?: TranscriptionSegment[]; fullText?: string; provider?: string }
    >({
      query: ({ courseId, videoId, ...body }) => ({
        url: `/courses/${courseId}/videos/${videoId}/transcription`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    updateVideoTranscription: builder.mutation<
      { message: string; transcription: VideoTranscription },
      { transcriptionId: string; segments?: TranscriptionSegment[]; fullText?: string; provider?: string }
    >({
      query: ({ transcriptionId, ...body }) => ({
        url: `/courses/transcriptions/${transcriptionId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteVideoTranscription: builder.mutation<{ message: string }, string>({
      query: (transcriptionId) => ({
        url: `/courses/transcriptions/${transcriptionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    createLiveStream: builder.mutation<{ message: string; liveStream: LiveStream }, { courseId: string } & Record<string, any>>({
      query: ({ courseId, ...body }) => ({
        url: `/courses/${courseId}/live-streams`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    getLiveStreams: builder.query<{ liveStreams: LiveStream[]; total: number }, { courseId: string; status?: string; upcoming?: boolean }>({
      query: ({ courseId, ...params }) => ({
        url: `/courses/${courseId}/live-streams`,
        params,
      }),
      providesTags: ['Course'],
    }),
    getLiveStream: builder.query<{ liveStream: LiveStream }, string>({
      query: (streamId) => `/courses/live-streams/${streamId}`,
      providesTags: (result, error, streamId) => [{ type: 'Course', id: `live-stream-${streamId}` }],
    }),
    updateLiveStream: builder.mutation<{ message: string; liveStream: LiveStream }, { streamId: string } & Record<string, any>>({
      query: ({ streamId, ...body }) => ({
        url: `/courses/live-streams/${streamId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteLiveStream: builder.mutation<{ message: string }, string>({
      query: (streamId) => ({
        url: `/courses/live-streams/${streamId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    startLiveStream: builder.mutation<{ message: string; liveStream: LiveStream }, string>({
      query: (streamId) => ({
        url: `/courses/live-streams/${streamId}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['Course'],
    }),
    endLiveStream: builder.mutation<
      { message: string; liveStream: LiveStream },
      { streamId: string; recordedVideoUrl?: string }
    >({
      query: ({ streamId, ...body }) => ({
        url: `/courses/live-streams/${streamId}/end`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    updateViewerCount: builder.mutation<{ message: string; viewers: number }, { streamId: string; viewers: number }>({
      query: ({ streamId, ...body }) => ({
        url: `/courses/live-streams/${streamId}/viewers`,
        method: 'PATCH',
        body,
      }),
    }),
    getLiveStreamChat: builder.query<{ messages: LiveStreamChatMessage[]; total: number }, { streamId: string; limit?: number }>({
      query: ({ streamId, ...params }) => ({
        url: `/courses/live-streams/${streamId}/chat`,
        params,
      }),
    }),
    sendLiveStreamMessage: builder.mutation<
      { message: string; chatMessage: LiveStreamChatMessage },
      { streamId: string; message: string; type?: string; parentMessageId?: string }
    >({
      query: ({ streamId, ...body }) => ({
        url: `/courses/live-streams/${streamId}/chat`,
        method: 'POST',
        body,
      }),
    }),
    likeLiveStreamMessage: builder.mutation<{ message: string; likes: number }, string>({
      query: (messageId) => ({
        url: `/courses/live-streams/chat/${messageId}/like`,
        method: 'POST',
      }),
    }),
    getStudentVideoAnalytics: builder.query<any, { courseId?: string; timeRange?: string }>({
      query: (params) => ({
        url: '/courses/analytics/student',
        params,
      }),
      providesTags: ['Course'],
    }),
    getVideoAnnotations: builder.query<{ annotations: VideoAnnotation[]; total: number }, { courseId: string; videoId: string }>({
      query: ({ courseId, videoId }) => `/courses/${courseId}/videos/${videoId}/annotations`,
      providesTags: (result, error, { courseId, videoId }) => [
        { type: 'Course', id: `${courseId}-${videoId}-annotations` },
      ],
    }),
    createVideoAnnotation: builder.mutation<
      { message: string; annotation: VideoAnnotation },
      { courseId: string; videoId: string } & Partial<VideoAnnotation>
    >({
      query: ({ courseId, videoId, ...body }) => ({
        url: `/courses/${courseId}/videos/${videoId}/annotations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    updateVideoAnnotation: builder.mutation<
      { message: string; annotation: VideoAnnotation },
      { annotationId: string } & Partial<VideoAnnotation>
    >({
      query: ({ annotationId, ...body }) => ({
        url: `/courses/annotations/${annotationId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteVideoAnnotation: builder.mutation<{ message: string }, string>({
      query: (annotationId) => ({
        url: `/courses/annotations/${annotationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    getCourseDiscussions: builder.query<
      { discussions: CourseDiscussion[]; pagination: { total: number; page: number; pages: number; limit: number } },
      { courseId: string; category?: string; page?: number; limit?: number; sort?: string; search?: string }
    >({
      query: ({ courseId, ...params }) => ({
        url: `/courses/${courseId}/discussions`,
        params,
      }),
      providesTags: ['Course'],
    }),
    getCourseDiscussion: builder.query<{ discussion: CourseDiscussion }, string>({
      query: (discussionId) => `/courses/discussions/${discussionId}`,
      providesTags: (result, error, discussionId) => [
        { type: 'Course', id: `discussion-${discussionId}` },
      ],
    }),
    createCourseDiscussion: builder.mutation<
      { message: string; discussion: CourseDiscussion },
      { courseId: string; title: string; content: string; category?: string; tags?: string[] }
    >({
      query: ({ courseId, ...body }) => ({
        url: `/courses/${courseId}/discussions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    updateCourseDiscussion: builder.mutation<
      { message: string; discussion: CourseDiscussion },
      { discussionId: string } & Partial<CourseDiscussion>
    >({
      query: ({ discussionId, ...body }) => ({
        url: `/courses/discussions/${discussionId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteCourseDiscussion: builder.mutation<{ message: string }, string>({
      query: (discussionId) => ({
        url: `/courses/discussions/${discussionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    addDiscussionReply: builder.mutation<
      { message: string; discussion: CourseDiscussion },
      { discussionId: string; content: string }
    >({
      query: ({ discussionId, ...body }) => ({
        url: `/courses/discussions/${discussionId}/replies`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    updateDiscussionReply: builder.mutation<
      { message: string; discussion: CourseDiscussion },
      { discussionId: string; replyIndex: number; content: string }
    >({
      query: ({ discussionId, replyIndex, ...body }) => ({
        url: `/courses/discussions/${discussionId}/replies/${replyIndex}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteDiscussionReply: builder.mutation<{ message: string; discussion: CourseDiscussion }, { discussionId: string; replyIndex: number }>({
      query: ({ discussionId, replyIndex }) => ({
        url: `/courses/discussions/${discussionId}/replies/${replyIndex}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),
    likeDiscussion: builder.mutation<{ message: string; likes: number }, string>({
      query: (discussionId) => ({
        url: `/courses/discussions/${discussionId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Course'],
    }),
    likeDiscussionReply: builder.mutation<{ message: string; likes: number }, { discussionId: string; replyIndex: number }>({
      query: ({ discussionId, replyIndex }) => ({
        url: `/courses/discussions/${discussionId}/replies/${replyIndex}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Course'],
    }),
    markReplyAsSolution: builder.mutation<
      { message: string; discussion: CourseDiscussion },
      { discussionId: string; replyIndex: number }
    >({
      query: ({ discussionId, replyIndex }) => ({
        url: `/courses/discussions/${discussionId}/replies/${replyIndex}/solution`,
        method: 'POST',
      }),
      invalidatesTags: ['Course'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseBySlugQuery,
  useEnrollInCourseMutation,
  useGetCourseVideosQuery,
  useGetCourseProgressQuery,
  useUpdateVideoProgressMutation,
  useGetVideoAnalyticsQuery,
  useGetVideoCommentsQuery,
  useCreateVideoCommentMutation,
  useUpdateVideoCommentMutation,
  useDeleteVideoCommentMutation,
  useToggleCommentLikeMutation,
  useGetVideoNotesQuery,
  useCreateVideoNoteMutation,
  useUpdateVideoNoteMutation,
  useDeleteVideoNoteMutation,
  useGetBookmarksQuery,
  useToggleVideoFavoriteMutation,
  useCheckVideoFavoriteQuery,
  useGetVideoFavoritesQuery,
  useRateVideoMutation,
  useGetVideoRatingsQuery,
  useGetVideoHistoryQuery,
  useGetVideoSubtitlesQuery,
  useCreateVideoSubtitleMutation,
  useUpdateVideoSubtitleMutation,
  useDeleteVideoSubtitleMutation,
  useCreatePlaylistMutation,
  useGetPlaylistsQuery,
  useGetPlaylistQuery,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useAddVideoToPlaylistMutation,
  useRemoveVideoFromPlaylistMutation,
  useGetVideoQuizQuery,
  useSubmitQuizAttemptMutation,
  useCreateVideoQuizMutation,
  useUpdateVideoQuizMutation,
  useDeleteVideoQuizMutation,
  useGenerateCertificateMutation,
  useGetUserCertificatesQuery,
  useGetCertificateQuery,
  useVerifyCertificateQuery,
  useGetRecommendedVideosQuery,
  useGetRelatedVideosQuery,
  useGetVideoDownloadUrlQuery,
  useGetVideoTranscriptionQuery,
  useCreateVideoTranscriptionMutation,
  useUpdateVideoTranscriptionMutation,
  useDeleteVideoTranscriptionMutation,
  useCreateLiveStreamMutation,
  useGetLiveStreamsQuery,
  useGetLiveStreamQuery,
  useUpdateLiveStreamMutation,
  useDeleteLiveStreamMutation,
  useStartLiveStreamMutation,
  useEndLiveStreamMutation,
  useUpdateViewerCountMutation,
  useGetLiveStreamChatQuery,
  useSendLiveStreamMessageMutation,
  useLikeLiveStreamMessageMutation,
  useGetStudentVideoAnalyticsQuery,
  useGetVideoAnnotationsQuery,
  useCreateVideoAnnotationMutation,
  useUpdateVideoAnnotationMutation,
  useDeleteVideoAnnotationMutation,
  useGetCourseDiscussionsQuery,
  useGetCourseDiscussionQuery,
  useCreateCourseDiscussionMutation,
  useUpdateCourseDiscussionMutation,
  useDeleteCourseDiscussionMutation,
  useAddDiscussionReplyMutation,
  useUpdateDiscussionReplyMutation,
  useDeleteDiscussionReplyMutation,
  useLikeDiscussionMutation,
  useLikeDiscussionReplyMutation,
  useMarkReplyAsSolutionMutation,
} = courseApi;
