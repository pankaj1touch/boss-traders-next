'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminCreateCourseMutation } from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import VideoUpload from '@/components/ui/VideoUpload';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateCoursePage() {
  const router = useRouter();
  const [createCourse, { isLoading }] = useAdminCreateCourseMutation();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
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

  const addChapter = (videoIndex: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((video, i) =>
        i === videoIndex
          ? {
              ...video,
              chapters: [...(video.chapters || []), { title: '', timestamp: 0, description: '' }],
            }
          : video
      ),
    }));
  };

  const updateChapter = (videoIndex: number, chapterIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((video, i) =>
        i === videoIndex
          ? {
              ...video,
              chapters: (video.chapters || []).map((chapter, j) =>
                j === chapterIndex ? { ...chapter, [field]: value } : chapter
              ),
            }
          : video
      ),
    }));
  };

  const removeChapter = (videoIndex: number, chapterIndex: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((video, i) =>
        i === videoIndex
          ? {
              ...video,
              chapters: (video.chapters || []).filter((_, j) => j !== chapterIndex),
            }
          : video
      ),
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

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a course title');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Please enter a course slug');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      alert('Please enter a description (at least 10 characters)');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0 || isNaN(Number(formData.price))) {
      alert('Please enter a valid price');
      return;
    }

    try {
      const courseData = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        outcomes: formData.outcomes ? formData.outcomes.split('\n').filter(Boolean) : [],
        prerequisites: formData.prerequisites ? formData.prerequisites.split('\n').filter(Boolean) : [],
      };

      await createCourse(courseData).unwrap();
      alert('Course created successfully!');
      router.push('/admin/courses');
    } catch (error: any) {
      console.error('Course creation error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create course';
      alert(`Error: ${errorMessage}`);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Create Course</h1>
          <p className="text-muted-foreground mt-1">Add a new course to the platform</p>
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
            </div>
          </div>

          {/* Course Videos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Course Videos</h2>
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
            
            {formData.videos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No videos added yet. Click "Add Video" to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.videos.map((video, index) => (
                  <div key={index} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-medium text-foreground">
                        Video {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVideo(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Video File
                        </label>
                        <VideoUpload
                          value={video.videoUrl}
                          onChange={(url) => updateVideo(index, 'videoUrl', url)}
                          type="courses"
                        />
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

          {/* Additional Course Details */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Additional Details</h2>
            <div className="space-y-4">
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
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Course'}
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

