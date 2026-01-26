'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Share2, Copy, Check, Heart, Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const VideoPlayer = dynamic(() => import('@/components/course/VideoPlayer'), {
  loading: () => <div className="aspect-video bg-black rounded-xl flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>,
  ssr: false,
});

const VideoList = dynamic(() => import('@/components/course/VideoList'), {
  loading: () => <div className="p-4 text-center text-muted-foreground">Loading videos...</div>,
});

const VideoComments = dynamic(() => import('@/components/course/VideoComments'), {
  loading: () => <div className="p-4 text-center text-muted-foreground">Loading comments...</div>,
});

const VideoNotes = dynamic(() => import('@/components/course/VideoNotes'), {
  loading: () => <div className="p-4 text-center text-muted-foreground">Loading notes...</div>,
});

const VideoQuiz = dynamic(() => import('@/components/course/VideoQuiz'), {
  loading: () => <div className="p-4 text-center text-muted-foreground">Loading quiz...</div>,
});

const VideoRecommendations = dynamic(() => import('@/components/course/VideoRecommendations'), {
  loading: () => <div className="p-4 text-center text-muted-foreground">Loading recommendations...</div>,
});

const VideoTranscription = dynamic(() => import('@/components/course/VideoTranscription'), {
  loading: () => <div className="p-4 text-center text-muted-foreground">Loading transcription...</div>,
});

const VideoAnnotations = dynamic(() => import('@/components/course/VideoAnnotations'), {
  loading: () => <div className="p-4 text-center text-muted-foreground">Loading annotations...</div>,
});

const CourseDiscussions = dynamic(() => import('@/components/course/CourseDiscussions'), {
  loading: () => <div className="p-4 text-center text-muted-foreground">Loading discussions...</div>,
});

import {
  useGetCourseBySlugQuery,
  useGetCourseVideosQuery,
  useGetCourseProgressQuery,
  useUpdateVideoProgressMutation,
  useToggleVideoFavoriteMutation,
  useCheckVideoFavoriteQuery,
  useRateVideoMutation,
  useGetVideoRatingsQuery,
  useGetVideoSubtitlesQuery,
  useGetPlaylistsQuery,
  useCreatePlaylistMutation,
  useAddVideoToPlaylistMutation,
  useGenerateCertificateMutation,
  useGetVideoDownloadUrlQuery,
} from '@/store/api/courseApi';
import { useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store/hooks';
import { API_BASE_URL } from '@/lib/config';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const slug = params.slug as string;
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: courseData, isLoading: loadingCourse } = useGetCourseBySlugQuery(slug);
  const course = courseData?.course;
  const courseId = course?._id;
  const isEnrolled = courseData?.isEnrolled || false;
  const { data: videosData, isLoading: loadingVideos } = useGetCourseVideosQuery(courseId || '', {
    skip: !courseId,
  });
  const { data: progressData } = useGetCourseProgressQuery(courseId || '', {
    skip: !courseId || !isEnrolled,
  });
  const [updateProgress] = useUpdateVideoProgressMutation();

  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({}); // videoId -> currentTime
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const videos = useMemo(() => videosData?.videos || [], [videosData?.videos]);
  const hasAccess = videosData?.hasAccess || false;
  const selectedVideo = videos[selectedVideoIndex];

  // Debug logging to identify the issue
  useEffect(() => {
    if (courseId) {
      console.log('🔍 Course Videos Debug:', {
        courseId,
        courseTitle: course?.title,
        isEnrolled,
        hasAccess,
        videosData,
        videosCount: videos.length,
        totalVideos: videosData?.totalVideos,
        loadingCourse,
        loadingVideos,
      });
    }
  }, [courseId, course, isEnrolled, hasAccess, videosData, videos.length, loadingCourse, loadingVideos]);

  const { data: favoriteData } = useCheckVideoFavoriteQuery(
    { courseId: courseId || '', videoId: selectedVideo?._id || '' },
    { skip: !courseId || !selectedVideo?._id }
  );
  const [toggleFavorite] = useToggleVideoFavoriteMutation();
  const [rateVideo] = useRateVideoMutation();
  const { data: ratingsData } = useGetVideoRatingsQuery(
    { courseId: courseId || '', videoId: selectedVideo?._id || '' },
    { skip: !courseId || !selectedVideo?._id }
  );
  const { data: subtitlesData } = useGetVideoSubtitlesQuery(
    { courseId: courseId || '', videoId: selectedVideo?._id || '' },
    { skip: !courseId || !selectedVideo?._id }
  );
  const { refetch: fetchDownloadUrl } = useGetVideoDownloadUrlQuery(
    { courseId: courseId || '', videoId: selectedVideo?._id || '' },
    { skip: true }
  );

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Load user rating when modal opens
  useEffect(() => {
    if (showRatingModal && ratingsData?.userRating) {
      setRating(ratingsData.userRating.rating);
      setReview(ratingsData.userRating.review || '');
    } else if (showRatingModal && !ratingsData?.userRating) {
      setRating(0);
      setReview('');
    }
  }, [showRatingModal, ratingsData]);

  // Check enrollment and access on mount
  useEffect(() => {
    // Wait for both course and videos to load
    if (!loadingCourse && !loadingVideos && course && videosData !== undefined) {
      // Check if course is published
      if (course.publishStatus !== 'published') {
        dispatch(
          addToast({
            type: 'error',
            message: 'This course is not available',
          })
        );
        router.push(`/courses/${slug}`);
        return;
      }

      // Debug logging
      console.log('🔍 Enrollment Check:', {
        isEnrolled,
        hasAccess,
        videosCount: videos.length,
        hasFreeVideos: videos.some((v) => v.isFree),
        courseId,
        courseTitle: course.title,
      });

      // Check enrollment and access
      // Use hasAccess from API response (more reliable)
      // Only show error if we definitely don't have access AND there are no free videos
      const hasFreeVideos = videos.some((v) => v.isFree);

      // If no access and no free videos, show error
      if (!hasAccess && !isEnrolled && !hasFreeVideos && videos.length > 0) {
        dispatch(
          addToast({
            type: 'error',
            message: 'You need to enroll in this course to access videos',
          })
        );
        // Don't redirect immediately - let user see the page
        // router.push(`/courses/${slug}`);
      } else if (!hasAccess && !isEnrolled && hasFreeVideos) {
        dispatch(
          addToast({
            type: 'info',
            message: 'You can preview free videos. Enroll to access all content.',
          })
        );
      }
    }
  }, [loadingCourse, loadingVideos, course, isEnrolled, hasAccess, videos, videosData, router, slug, dispatch, courseId]);

  // Load progress from API and localStorage on mount
  useEffect(() => {
    if (courseId && progressData) {
      // Load from API first
      const apiProgress: Record<string, number> = {};
      Object.keys(progressData.videoProgress || {}).forEach((videoId) => {
        apiProgress[videoId] = progressData.videoProgress[videoId].currentTime;
      });
      setVideoProgress(apiProgress);
      setCompletedVideos(new Set(progressData.completedVideos || []));

      // Also load from localStorage as fallback
      const savedProgress = localStorage.getItem(`course_progress_${courseId}`);
      if (savedProgress) {
        try {
          const localProgress = JSON.parse(savedProgress);
          // Merge with API data (API takes precedence)
          setVideoProgress((prev) => ({ ...localProgress.progress, ...prev }));
          setCompletedVideos((prev) => {
            const merged = new Set(prev);
            (localProgress.completed || []).forEach((id: string) => merged.add(id));
            return merged;
          });
        } catch (e) {
          console.error('Failed to load progress from localStorage', e);
        }
      }
    } else if (courseId) {
      // Fallback to localStorage only if API not available
      const savedProgress = localStorage.getItem(`course_progress_${courseId}`);
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          setVideoProgress(progress.progress || {});
          setCompletedVideos(new Set(progress.completed || []));
        } catch (e) {
          console.error('Failed to load progress from localStorage', e);
        }
      }
    }
  }, [courseId, progressData]);

  // Select first available video or video from URL query
  useEffect(() => {
    if (videos.length > 0) {
      const queryVideoId = new URLSearchParams(window.location.search).get('video');
      const queryTime = new URLSearchParams(window.location.search).get('t');

      if (queryVideoId) {
        const indexFromQuery = videos.findIndex((v) => v._id === queryVideoId);
        if (indexFromQuery !== -1 && (hasAccess || videos[indexFromQuery].isFree)) {
          setSelectedVideoIndex(indexFromQuery);
          if (queryTime) {
            // Set video time after video loads
            setTimeout(() => {
              const videoElement = document.querySelector('video');
              if (videoElement) {
                videoElement.currentTime = parseInt(queryTime, 10);
              }
            }, 1000);
          }
          return;
        }
      }

      // Find first accessible video if no query param or query param video is not accessible
      if (selectedVideoIndex === 0) {
        const firstAccessible = videos.findIndex((v) => hasAccess || v.isFree);
        if (firstAccessible >= 0) {
          setSelectedVideoIndex(firstAccessible);
        }
      }
    }
  }, [videos, hasAccess, selectedVideoIndex]);

  // Save progress to localStorage
  const saveProgressToLocal = (videoId: string, currentTime: number, duration: number) => {
    if (!courseId || !videoId) return;

    const progress = { ...videoProgress, [videoId]: currentTime };
    setVideoProgress(progress);

    // Check if video is completed (90% watched)
    const watchPercentage = (currentTime / duration) * 100;
    if (watchPercentage >= 90 && !completedVideos.has(videoId)) {
      setCompletedVideos((prev) => new Set(prev).add(videoId));
    }

    // Save to localStorage
    const savedData = {
      progress,
      completed: Array.from(completedVideos),
      lastUpdated: Date.now(),
    };
    localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(savedData));
  };

  // Handle video progress update (debounced)
  const handleVideoProgress = async (currentTime: number, duration: number) => {
    if (!selectedVideo?._id || !courseId) return;

    // Update current video time for comments/notes
    setCurrentVideoTime(currentTime);

    // Save to local state immediately
    saveProgressToLocal(selectedVideo._id, currentTime, duration);

    // Save to backend API (debounced - every 10 seconds)
    const watchPercentage = (currentTime / duration) * 100;
    const isCompleted = watchPercentage >= 90;

    try {
      await updateProgress({
        courseId,
        videoId: selectedVideo._id,
        currentTime,
        duration,
        completed: isCompleted,
      }).unwrap();
    } catch (error) {
      console.error('Failed to save progress to backend', error);
      // Continue with localStorage fallback
    }
  };

  const handleNoteClick = (timestamp: number) => {
    // Seek video to note timestamp
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.currentTime = timestamp;
      videoElement.play();
    }
  };

  const handleShareVideo = () => {
    if (!selectedVideo?._id) return;

    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/courses/${slug}/learn?video=${selectedVideo._id}&t=${Math.floor(currentVideoTime)}`;
    setShareLink(shareUrl);
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy', error);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `Check out this video: ${selectedVideo?.title}`;
    const url = shareLink;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleDownload = async () => {
    if (!courseId || !selectedVideo?._id) return;

    try {
      const result = await fetchDownloadUrl();
      if ('data' in result && result.data?.downloadUrl) {
        window.open(result.data.downloadUrl, '_blank');
        return;
      }

      dispatch(
        addToast({
          type: 'error',
          message: 'Failed to generate download link',
        })
      );
    } catch (error) {
      console.error('Failed to download video', error);
      dispatch(
        addToast({
          type: 'error',
          message: 'Failed to download video',
        })
      );
    }
  };

  const handleVideoSelect = (index: number) => {
    const video = videos[index];

    // Check if video is locked and user doesn't have access
    if (video.locked && !hasAccess) {
      dispatch(
        addToast({
          type: 'info',
          message: 'Please enroll in the course to access this video',
        })
      );
      // Optionally redirect to course page
      setTimeout(() => {
        router.push(`/courses/${slug}`);
      }, 2000);
      return;
    }

    // Check if video URL is valid
    if (!video.videoUrl || video.videoUrl.trim() === '') {
      dispatch(
        addToast({
          type: 'error',
          message: 'Video URL is not available',
        })
      );
      return;
    }

    setSelectedVideoIndex(index);
  };

  const handleVideoComplete = async () => {
    if (selectedVideo?._id && courseId) {
      const newCompleted = new Set([...Array.from(completedVideos), selectedVideo._id]);
      setCompletedVideos(newCompleted);

      // Save completion to localStorage
      const savedData = {
        progress: videoProgress,
        completed: Array.from(newCompleted),
        lastUpdated: Date.now(),
      };
      localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(savedData));

      // Save completion to backend API
      try {
        const currentProgress = videoProgress[selectedVideo._id] || 0;
        await updateProgress({
          courseId,
          videoId: selectedVideo._id,
          currentTime: currentProgress,
          duration: selectedVideo.duration || 0,
          completed: true,
        }).unwrap();
      } catch (error) {
        console.error('Failed to save completion to backend', error);
      }

      // Show completion modal
      setShowCompletionModal(true);

      // Auto-play next video if enabled
      if (autoPlayNext && selectedVideoIndex < videos.length - 1) {
        const nextIndex = selectedVideoIndex + 1;
        const nextVideo = videos[nextIndex];
        if (!nextVideo.locked || hasAccess) {
          setTimeout(() => {
            setSelectedVideoIndex(nextIndex);
            setShowCompletionModal(false);
          }, 2000);
        }
      }
    }
  };

  const handleMarkAsComplete = async () => {
    if (selectedVideo?._id && courseId) {
      await handleVideoComplete();
    }
  };

  // Get saved progress time for current video
  const getSavedProgressTime = () => {
    if (!selectedVideo?._id) return 0;
    return videoProgress[selectedVideo._id] || 0;
  };

  const handleNextVideo = () => {
    if (selectedVideoIndex < videos.length - 1) {
      const nextIndex = selectedVideoIndex + 1;
      const nextVideo = videos[nextIndex];
      if (!nextVideo.locked || hasAccess) {
        setSelectedVideoIndex(nextIndex);
      }
    }
  };

  const handlePreviousVideo = () => {
    if (selectedVideoIndex > 0) {
      setSelectedVideoIndex(selectedVideoIndex - 1);
    }
  };

  const calculateProgress = () => {
    if (videos.length === 0) return 0;
    const completedCount = videos.filter((v) => v._id && completedVideos.has(v._id)).length;
    return Math.round((completedCount / videos.length) * 100);
  };

  const calculateEstimatedTimeRemaining = () => {
    const totalDuration = videos.reduce((sum, video) => sum + (video.duration || 0), 0);
    const watchedDuration = videos.reduce((sum, video) => {
      if (video._id && videoProgress[video._id]) {
        return sum + videoProgress[video._id];
      }
      if (video._id && completedVideos.has(video._id)) {
        return sum + (video.duration || 0);
      }
      return sum;
    }, 0);
    const remaining = totalDuration - watchedDuration;

    if (remaining <= 0) return '0 min';

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const canGoNext = selectedVideoIndex < videos.length - 1;
  const canGoPrevious = selectedVideoIndex > 0;


  if (loadingCourse || loadingVideos) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <h1 className="text-4xl font-bold">Course not found</h1>
          <Link href="/courses">
            <Button className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Allow access if enrolled OR if there are free videos OR if hasAccess from API
  const hasFreeVideos = videos.some((v) => v.isFree);
  const canAccess = isEnrolled || hasAccess || hasFreeVideos;

  // Only show access denied if we've finished loading and definitely don't have access
  // But allow access if videos are loading or if there are free videos
  if (!canAccess && !loadingCourse && !loadingVideos && videosData !== undefined && videos.length > 0 && !hasFreeVideos) {
    // Only block if we have videos but no access and no free videos
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <h1 className="text-4xl font-bold">Access Denied</h1>
          <p className="mt-4 text-muted-foreground">
            You need to enroll in this course to access videos
          </p>
          <Link href={`/courses/${slug}`}>
            <Button className="mt-4">Go to Course Page</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show message if no videos available
  if (!loadingCourse && !loadingVideos && videosData !== undefined && videos.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <h1 className="text-4xl font-bold">No Videos Available</h1>
          <p className="mt-4 text-muted-foreground">
            This course doesn't have any videos yet.
          </p>
          <Link href={`/courses/${slug}`}>
            <Button className="mt-4">Back to Course Page</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-6">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/courses/${slug}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Course
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {videos.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Course Progress</span>
                  <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {videos.filter((v) => v._id && completedVideos.has(v._id)).length} of {videos.length} videos completed
                  </span>
                  {videos.length > 0 && (
                    <span>
                      ~{calculateEstimatedTimeRemaining()} remaining
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Video Player - Main Content */}
          <div className="lg:col-span-3">
            {selectedVideo ? (
              <div className="space-y-4">
                {selectedVideo ? (
                  <div className="space-y-6">
                    <div className="relative z-10">
                      {/* Main Player Component */}
                      {selectedVideo.videoUrl && selectedVideo.videoUrl.trim() !== '' ? (
                        <VideoPlayer
                          src={selectedVideo.videoUrl}
                          title={selectedVideo.title}
                          onComplete={handleVideoComplete}
                          onProgress={handleVideoProgress}
                          autoplay={autoPlayNext}
                          startTime={getSavedProgressTime()}
                          chapters={selectedVideo.chapters || []}
                          qualities={selectedVideo.videoQualities || []}
                          subtitles={subtitlesData?.subtitles || []}
                        />
                      ) : (
                        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700">
                          <CardContent className="p-12 text-center">
                            <div className="flex flex-col items-center gap-6">
                              <div className="rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-6 shadow-lg">
                                <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                                  Video Not Available
                                </h3>
                                <p className="text-lg text-yellow-800 dark:text-yellow-200 max-w-md">
                                  This video hasn't been uploaded yet. The instructor is working on it.
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                  Please check back later or contact support if you think this is an error.
                                </p>
                              </div>
                              <div className="flex gap-3 mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => window.location.reload()}
                                  className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                                >
                                  Refresh Page
                                </Button>
                                <Link href={`/courses/${slug}`}>
                                  <Button variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-900/30">
                                    Back to Course
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Course Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-brand-navy/50 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white hidden md:block">{selectedVideo.title}</h2>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (!courseId || !selectedVideo?._id) return;
                            try {
                              await toggleFavorite({ courseId, videoId: selectedVideo._id }).unwrap();
                              dispatch(
                                addToast({
                                  type: 'success',
                                  message: favoriteData?.isFavorite
                                    ? 'Removed from favorites'
                                    : 'Added to favorites',
                                })
                              );
                            } catch (error) {
                              console.error('Failed to toggle favorite', error);
                            }
                          }}
                          className={`hover:bg-white/10 ${favoriteData?.isFavorite ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-white'}`}
                          title={favoriteData?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className={`h-5 w-5 ${favoriteData?.isFavorite ? 'fill-current' : ''}`} />
                          <span className="ml-2 hidden sm:inline">{favoriteData?.isFavorite ? 'Saved' : 'Save'}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRatingModal(true)}
                          className="text-gray-400 hover:text-brand-gold hover:bg-white/10"
                          title="Rate this video"
                        >
                          <Star className="h-5 w-5" />
                          <span className="ml-2 hidden sm:inline">{ratingsData?.averageRating ? ratingsData.averageRating.toFixed(1) : 'Rate'}</span>
                        </Button>

                        <div className="h-6 w-px bg-white/10 mx-1" />

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleShareVideo}
                          className="text-gray-400 hover:text-brand-blue hover:bg-white/10"
                        >
                          <Share2 className="h-5 w-5" />
                          <span className="ml-2 hidden sm:inline">Share</span>
                        </Button>

                        {hasAccess && selectedVideo?._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownload}
                            className="text-gray-400 hover:text-brand-neon hover:bg-white/10"
                            title="Download video"
                          >
                            <Download className="h-5 w-5" />
                            <span className="ml-2 hidden sm:inline">Download</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    {selectedVideo.description && (
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="mb-2 font-semibold text-foreground">About this video</h3>
                          <p className="text-muted-foreground">{selectedVideo.description}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Video Notes */}
                    {courseId && selectedVideo?._id && (
                      <VideoNotes
                        courseId={courseId}
                        videoId={selectedVideo._id}
                        currentTime={currentVideoTime}
                        onNoteClick={handleNoteClick}
                      />
                    )}

                    {/* Video Quiz */}
                    {courseId && selectedVideo?._id && (
                      <VideoQuiz
                        courseId={courseId}
                        videoId={selectedVideo._id}
                      />
                    )}

                    {/* Video Transcription */}
                    {courseId && selectedVideo?._id && (
                      <VideoTranscription
                        courseId={courseId}
                        videoId={selectedVideo._id}
                        currentTime={currentVideoTime}
                        onSegmentClick={handleNoteClick}
                      />
                    )}

                    {/* Video Annotations */}
                    {courseId && selectedVideo?._id && (
                      <VideoAnnotations
                        courseId={courseId}
                        videoId={selectedVideo._id}
                        currentTime={currentVideoTime}
                        onAnnotationClick={handleNoteClick}
                      />
                    )}

                    {/* Video Comments */}
                    {courseId && selectedVideo?._id && (
                      <VideoComments
                        courseId={courseId}
                        videoId={selectedVideo._id}
                        currentTime={currentVideoTime}
                      />
                    )}

                    {/* Course Discussions */}
                    {courseId && (
                      <CourseDiscussions courseId={courseId} />
                    )}

                    {/* Navigation */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <Button
                          variant="outline"
                          onClick={handlePreviousVideo}
                          disabled={!canGoPrevious}
                          className="flex items-center gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous Video
                        </Button>

                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            Video {selectedVideoIndex + 1} of {videos.length}
                          </div>

                          {/* Auto-play toggle */}
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={autoPlayNext}
                              onChange={(e) => setAutoPlayNext(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-muted-foreground">Auto-play next</span>
                          </label>
                        </div>

                        <Button
                          variant="outline"
                          onClick={handleNextVideo}
                          disabled={!canGoNext || (videos[selectedVideoIndex + 1]?.locked && !hasAccess)}
                          className="flex items-center gap-2"
                        >
                          Next Video
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Mark as Complete Button */}
                      {selectedVideo?._id && !completedVideos.has(selectedVideo._id) && (
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            onClick={handleMarkAsComplete}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No videos available</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}

            {/* Video List Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <h2 className="mb-4 font-semibold text-foreground">Course Videos</h2>
                  <div className="max-h-[600px] overflow-y-auto">
                    <VideoList
                      videos={videos}
                      currentVideoIndex={selectedVideoIndex}
                      completedVideoIds={completedVideos}
                      hasAccess={hasAccess}
                      onVideoSelect={handleVideoSelect}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Share Video"
          size="md"
        >
          <div className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={copyToClipboard}
                  variant={copied ? 'outline' : 'primary'}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Share on Social Media
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('twitter')}
                  className="w-full"
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('facebook')}
                  className="w-full"
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('linkedin')}
                  className="w-full"
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('whatsapp')}
                  className="w-full"
                >
                  WhatsApp
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              The link includes the current video timestamp. Recipients will start watching from this point.
            </p>
          </div>
        </Modal>

        {/* Completion Modal */}
        <Modal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          title="Video Completed! 🎉"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Great job! You've completed "{selectedVideo?.title}".
            </p>

            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm font-bold">{calculateProgress()}%</span>
            </div>

            {canGoNext && !(videos[selectedVideoIndex + 1]?.locked && !hasAccess) ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1"
                >
                  Stay Here
                </Button>
                <Button
                  onClick={() => {
                    handleNextVideo();
                    setShowCompletionModal(false);
                  }}
                  className="flex-1"
                >
                  Next Video
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowCompletionModal(false)}
                className="w-full"
              >
                Close
              </Button>
            )}
          </div>
        </Modal>

        <Footer />
      </div>
    </div>
  );
}
