'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminGetCourseQuery, useAdminUpdateCourseMutation } from '@/store/api/adminApi';
import { useGetVideoAnalyticsQuery } from '@/store/api/courseApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import VideoUpload from '@/components/ui/VideoUpload';
import { Modal } from '@/components/ui/Modal';
import VideoPlayer from '@/components/course/VideoPlayer';
import { ArrowLeft, Plus, X, BarChart3, Eye, Users, Clock, CheckCircle2, Trash2, ArrowUp, ArrowDown, Play, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { API_BASE_URL } from '@/lib/config';

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, isLoading: loadingCourse } = useAdminGetCourseQuery(params.id);
  const [updateCourse, { isLoading: updating }] = useAdminUpdateCourseMutation();
  const { data: analyticsData, isLoading: loadingAnalytics } = useGetVideoAnalyticsQuery(params.id, {
    skip: !params.id,
  });
  const analyticsTimeRange = (analyticsData as { timeRange?: string } | undefined)?.timeRange || '30';

  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [previewVideoTitle, setPreviewVideoTitle] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'programming',
    price: '',
    salePrice: '',
    language: 'English',
    level: 'beginner',
    tags: '',
    thumbnail: '',
    description: '',
    outcomes: '',
    prerequisites: '',
    modality: 'recorded',
    publishStatus: 'draft',
    videos: [] as Array<{
      title: string;
      description: string;
      videoUrl: string;
      duration: number;
      isFree: boolean;
      order: number;
      thumbnail: string;
      chapters: Array<{
        title: string;
        timestamp: number;
        description: string;
      }>;
    }>,
  });

  useEffect(() => {
    if (data?.course) {
      setFormData({
        title: data.course.title || '',
        slug: data.course.slug || '',
        category: data.course.category || 'programming',
        price: String(data.course.price || ''),
        salePrice: data.course.salePrice ? String(data.course.salePrice) : '',
        language: data.course.language || 'English',
        level: data.course.level || 'beginner',
        tags: data.course.tags?.join(', ') || '',
        thumbnail: data.course.thumbnail || '',
        description: data.course.description || '',
        outcomes: data.course.outcomes?.join('\n') || '',
        prerequisites: data.course.prerequisites?.join('\n') || '',
        modality: data.course.modality || 'recorded',
        publishStatus: data.course.publishStatus || 'draft',
        videos: data.course.videos?.map((video: any) => ({
          title: video.title || '',
          description: video.description || '',
          videoUrl: video.videoUrl || '',
          duration: video.duration || 0,
          isFree: video.isFree || false,
          order: video.order || 0,
          thumbnail: video.thumbnail || '',
          chapters: video.chapters || [],
        })) || [],
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addVideo = () => {
    const newVideo = {
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      isFree: false,
      order: formData.videos.length,
      thumbnail: '',
      chapters: [],
    };
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo]
    }));
  };

  const updateVideo = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((video, i) =>
        i === index ? { ...video, [field]: value } : video
      )
    }));
  };

  const addChapter = (videoIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.map((video, i) =>
        i === videoIndex
          ? {
            ...video,
            chapters: [
              ...(video.chapters || []),
              { title: '', timestamp: 0, description: '' },
            ],
          }
          : video
      ),
    }));
  };

  const updateChapter = (
    videoIndex: number,
    chapterIndex: number,
    field: 'title' | 'timestamp' | 'description',
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.map((video, i) =>
        i === videoIndex
          ? {
            ...video,
            chapters: (video.chapters || []).map((chapter, cIndex) =>
              cIndex === chapterIndex ? { ...chapter, [field]: value } : chapter
            ),
          }
          : video
      ),
    }));
  };

  const removeChapter = (videoIndex: number, chapterIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.map((video, i) =>
        i === videoIndex
          ? {
            ...video,
            chapters: (video.chapters || []).filter((_, cIndex) => cIndex !== chapterIndex),
          }
          : video
      ),
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index).map((v, i) => ({ ...v, order: i }))
    }));
    setSelectedVideos(new Set());
  };

  const bulkDeleteVideos = () => {
    if (selectedVideos.size === 0) return;
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => !selectedVideos.has(i)).map((v, i) => ({ ...v, order: i }))
    }));
    setSelectedVideos(new Set());
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.videos.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setFormData(prev => {
      const newVideos = [...prev.videos];
      [newVideos[index], newVideos[newIndex]] = [newVideos[newIndex], newVideos[index]];
      return {
        ...prev,
        videos: newVideos.map((v, i) => ({ ...v, order: i }))
      };
    });
  };

  const toggleVideoSelection = (index: number) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAllVideos = () => {
    if (selectedVideos.size === formData.videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(formData.videos.map((_, i) => i)));
    }
  };

  const previewVideo = (videoUrl: string, title: string) => {
    if (!videoUrl) {
      alert('No video URL available');
      return;
    }
    setPreviewVideoUrl(videoUrl);
    setPreviewVideoTitle(title);
    setShowPreviewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const courseData = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        outcomes: formData.outcomes.split('\n').filter(Boolean),
        prerequisites: formData.prerequisites.split('\n').filter(Boolean),
        videos: formData.videos.map((video, index) => ({
          ...video,
          order: video.order !== undefined ? video.order : index,
        })),
      };

      await updateCourse({ id: params.id, data: courseData }).unwrap();
      alert('Course updated successfully!');
      router.push('/admin/courses');
    } catch (error: any) {
      alert(error?.data?.message || 'Failed to update course');
    }
  };

  if (loadingCourse) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-muted-foreground mt-4">Loading course...</p>
      </div>
    );
  }

  if (!data?.course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Course not found</p>
        <Link href="/admin/courses">
          <Button className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Course</h1>
          <p className="text-muted-foreground mt-1">Update course information</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Enrollments</p>
          <p className="text-2xl font-bold text-foreground mt-1">{data.enrollmentCount || 0}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Modules</p>
          <p className="text-2xl font-bold text-foreground mt-1">{data.modules?.length || 0}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Lessons</p>
          <p className="text-2xl font-bold text-foreground mt-1">{data.lessons?.length || 0}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Videos</p>
          <p className="text-2xl font-bold text-foreground mt-1">{data.course?.videos?.length || 0}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="course-slug"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="data-science">Data Science</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Enter course description"
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sale Price (₹)</label>
                <Input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  min="0"
                  placeholder="799"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Additional Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                  <Input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    placeholder="English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Modality</label>
                  <select
                    name="modality"
                    value={formData.modality}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="live">Live</option>
                    <option value="recorded">Recorded</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Course Thumbnail
                </label>
                <ImageUpload
                  value={formData.thumbnail}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                  type="courses"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (comma-separated)
                </label>
                <Input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="react, javascript, web-development"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Learning Outcomes (one per line)
                </label>
                <textarea
                  name="outcomes"
                  value={formData.outcomes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Build real-world applications&#10;Master React fundamentals&#10;..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Prerequisites (one per line)
                </label>
                <textarea
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Basic HTML/CSS knowledge&#10;JavaScript fundamentals&#10;..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Publish Status</label>
                <select
                  name="publishStatus"
                  value={formData.publishStatus}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Videos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Course Videos</h2>
              <div className="flex items-center gap-2">
                {formData.videos.length > 0 && selectedVideos.size > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={bulkDeleteVideos}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedVideos.size})
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVideo}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Video
                </Button>
              </div>
            </div>

            {formData.videos.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedVideos.size === formData.videos.length}
                  onChange={selectAllVideos}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-muted-foreground">
                  Select All ({selectedVideos.size} selected)
                </span>
              </div>
            )}

            {formData.videos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground rounded-xl border border-border bg-card">
                <p>No videos added yet. Click "Add Video" to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.videos.map((video, index) => (
                  <div key={index} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedVideos.has(index)}
                          onChange={() => toggleVideoSelection(index)}
                          className="rounded border-gray-300"
                        />
                        <h3 className="text-md font-medium text-foreground">
                          Video {index + 1}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {video.videoUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => previewVideo(video.videoUrl, video.title)}
                            className="flex items-center gap-1"
                            title="Preview Video"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveVideo(index, 'up')}
                          disabled={index === 0}
                          className="flex items-center gap-1"
                          title="Move Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveVideo(index, 'down')}
                          disabled={index === formData.videos.length - 1}
                          className="flex items-center gap-1"
                          title="Move Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVideo(index)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Video"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Video Title *
                          </label>
                          <Input
                            type="text"
                            value={video.title}
                            onChange={(e) => updateVideo(index, 'title', e.target.value)}
                            placeholder="Enter video title"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Duration (seconds)
                          </label>
                          <Input
                            type="number"
                            value={video.duration}
                            onChange={(e) => updateVideo(index, 'duration', Number(e.target.value))}
                            placeholder="300"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Video Description
                        </label>
                        <textarea
                          value={video.description}
                          onChange={(e) => updateVideo(index, 'description', e.target.value)}
                          placeholder="Enter video description"
                          className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={3}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-foreground">
                            Video File
                          </label>
                          {video.videoUrl && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/video/thumbnail`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                                    },
                                    body: JSON.stringify({
                                      videoUrl: video.videoUrl,
                                      timestamp: 1,
                                      folder: 'courses',
                                    }),
                                  });
                                  const data = await response.json();
                                  if (data.success && data.thumbnailUrl) {
                                    updateVideo(index, 'thumbnail', data.thumbnailUrl);
                                    dispatch(
                                      addToast({
                                        type: 'success',
                                        message: 'Thumbnail generated successfully!',
                                      })
                                    );
                                  } else {
                                    throw new Error(data.message || 'Failed to generate thumbnail');
                                  }
                                } catch (error: any) {
                                  dispatch(
                                    addToast({
                                      type: 'error',
                                      message: error.message || 'Failed to generate thumbnail. Make sure ffmpeg is installed on server.',
                                    })
                                  );
                                }
                              }}
                              className="flex items-center gap-1"
                              title="Generate thumbnail from video (requires ffmpeg)"
                            >
                              <ImageIcon className="h-4 w-4" />
                              Generate Thumbnail
                            </Button>
                          )}
                        </div>
                        <VideoUpload
                          value={video.videoUrl}
                          onChange={(url) => updateVideo(index, 'videoUrl', url)}
                          type="courses"
                        />
                        {video.thumbnail && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Thumbnail
                            </label>
                            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-border">
                              <img
                                src={video.thumbnail}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Input
                              type="text"
                              value={video.thumbnail}
                              onChange={(e) => updateVideo(index, 'thumbnail', e.target.value)}
                              placeholder="Thumbnail URL"
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>

                      {/* Video Chapters */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-foreground">
                            Video Chapters (Optional)
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addChapter(index)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Add Chapter
                          </Button>
                        </div>
                        {video.chapters && video.chapters.length > 0 && (
                          <div className="space-y-2 mt-2 p-4 rounded-lg border border-border bg-muted/50">
                            {video.chapters.map((chapter, chapterIndex) => (
                              <div key={chapterIndex} className="flex gap-2 items-start">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Chapter title"
                                    value={chapter.title}
                                    onChange={(e) => updateChapter(index, chapterIndex, 'title', e.target.value)}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Timestamp (seconds)"
                                    value={chapter.timestamp}
                                    onChange={(e) => updateChapter(index, chapterIndex, 'timestamp', Number(e.target.value))}
                                    min="0"
                                  />
                                  <Input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={chapter.description || ''}
                                    onChange={(e) => updateChapter(index, chapterIndex, 'description', e.target.value)}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeChapter(index, chapterIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`free-${index}`}
                            checked={video.isFree}
                            onChange={(e) => updateVideo(index, 'isFree', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`free-${index}`} className="text-sm font-medium">
                            Free Preview
                          </label>
                        </div>

                        <div className="flex-1">
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Order
                          </label>
                          <Input
                            type="number"
                            value={video.order}
                            onChange={(e) => updateVideo(index, 'order', Number(e.target.value))}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video Preview Modal */}
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={previewVideoTitle || 'Video Preview'}
          size="xl"
        >
          <div className="p-4">
            <VideoPlayer
              src={previewVideoUrl}
              title={previewVideoTitle}
              autoplay={false}
            />
          </div>
        </Modal>

        {/* Video Analytics */}
        {analyticsData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Video Analytics</h2>
              </div>
              <select
                value={analyticsTimeRange}
                onChange={(e) => {
                  // Refetch with new time range
                  window.location.search = `?timeRange=${e.target.value}`;
                }}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.overallStats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Unique Viewers</p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.overallStats.totalUniqueViewers.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Completions</p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.overallStats.totalCompletions.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Avg Completion Rate</p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.overallStats.averageCompletionRate.toFixed(1)}%
                </p>
              </div>
              {analyticsData.overallStats.averageEngagement !== undefined && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Avg Engagement</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {analyticsData.overallStats.averageEngagement.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {/* Trends Chart */}
            {analyticsData.trends?.viewsOverTime && analyticsData.trends.viewsOverTime.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 mb-6">
                <h3 className="text-md font-semibold text-foreground mb-4">Views Over Time</h3>
                <div className="space-y-2">
                  {analyticsData.trends?.viewsOverTime?.map((day: any, index: number) => {
                    const maxViews = Math.max(...(analyticsData.trends?.viewsOverTime || []).map((d: any) => d.views || 0));
                    const percentage = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-24">
                          {new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                          <div
                            className="h-full bg-primary transition-all duration-300 flex items-center justify-end pr-2"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-xs font-medium text-white">{day.views}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {day.uniqueViewers.length} viewers
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Charts Section */}
            {analyticsData.videos.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Views Chart */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-md font-semibold text-foreground mb-4">Views by Video</h3>
                  <div className="space-y-3">
                    {analyticsData.videos
                      .sort((a, b) => (b.analytics?.totalViews || 0) - (a.analytics?.totalViews || 0))
                      .slice(0, 5)
                      .map((video, index) => {
                        const maxViews = Math.max(...analyticsData.videos.map(v => v.analytics?.totalViews || 0));
                        const percentage = maxViews > 0 ? ((video.analytics?.totalViews || 0) / maxViews) * 100 : 0;
                        return (
                          <div key={video._id || index}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground truncate flex-1 mr-2">
                                {video.title}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {video.analytics?.totalViews || 0}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Completion Rate Chart */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-md font-semibold text-foreground mb-4">Completion Rate by Video</h3>
                  <div className="space-y-3">
                    {analyticsData.videos
                      .sort((a, b) => {
                        const rateA = a.analytics?.totalViews > 0
                          ? (a.analytics?.completions || 0) / a.analytics?.totalViews * 100
                          : 0;
                        const rateB = b.analytics?.totalViews > 0
                          ? (b.analytics?.completions || 0) / b.analytics?.totalViews * 100
                          : 0;
                        return rateB - rateA;
                      })
                      .slice(0, 5)
                      .map((video, index) => {
                        const completionRate = video.analytics?.totalViews > 0
                          ? ((video.analytics?.completions || 0) / video.analytics?.totalViews) * 100
                          : 0;
                        return (
                          <div key={video._id || index}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground truncate flex-1 mr-2">
                                {video.title}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {completionRate.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Video List with Analytics */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-md font-semibold text-foreground mb-4">Video Performance</h3>
              <div className="space-y-4">
                {analyticsData.videos.map((video, index) => (
                  <div
                    key={video._id || index}
                    className="border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{video.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {video.duration ? `${Math.floor(video.duration / 60)} min` : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {video.analytics.completionRate.toFixed(1)}% completion
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-medium text-foreground">
                          {video.analytics.totalViews.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Viewers</p>
                        <p className="font-medium text-foreground">
                          {video.analytics.uniqueViewers.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completions</p>
                        <p className="font-medium text-foreground">
                          {video.analytics.completions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Watch Time</p>
                        <p className="font-medium text-foreground">
                          {Math.floor(video.analytics.averageWatchTime / 60)} min
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={updating}>
            {updating ? 'Updating...' : 'Update Course'}
          </Button>
          <Link href="/admin/courses">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}



