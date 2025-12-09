'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminCreateAnnouncementMutation } from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import ImageUpload from '@/components/ui/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createAnnouncement, { isLoading }] = useAdminCreateAnnouncementMutation();

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    description: '',
    type: 'general' as const,
    audience: 'all' as const,
    priority: 'medium' as const,
    imageUrl: '',
    linkUrl: '',
    linkText: 'Learn More',
    isActive: true,
    startDate: '',
    endDate: '',
    status: 'draft' as const,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'datetime-local'
          ? value
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter a title' }));
      return;
    }
    if (!formData.body.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter announcement body' }));
      return;
    }

    // Convert datetime-local to ISO string
    const submitData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      imageUrl: formData.imageUrl || undefined,
      linkUrl: formData.linkUrl || undefined,
      description: formData.description || undefined,
    };

    try {
      await createAnnouncement(submitData).unwrap();
      dispatch(addToast({ type: 'success', message: 'Announcement created successfully!' }));
      router.push('/admin/announcements');
    } catch (error: any) {
      console.error('Announcement creation error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create announcement';
      dispatch(addToast({ type: 'error', message: errorMessage }));
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/announcements">
          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Announcement</h1>
          <p className="text-muted-foreground mt-1">Add a new announcement to the platform</p>
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
                  placeholder="Enter announcement title"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (Short summary)
                </label>
                <Input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter short description (optional)"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Body/Content <span className="text-red-500">*</span>
                </label>
                <Textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Enter announcement content..."
                />
              </div>
            </div>
          </div>

          {/* Type & Priority */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Type & Priority</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="general">General</option>
                  <option value="course">Course</option>
                  <option value="payment">Payment</option>
                  <option value="educational">Educational</option>
                  <option value="system">System</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Audience</label>
                <select
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="instructors">Instructors Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Media & Links */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Media & Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image (Optional)
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  type="blog"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Link URL</label>
                  <Input
                    type="url"
                    name="linkUrl"
                    value={formData.linkUrl}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Link Text</label>
                  <Input
                    type="text"
                    name="linkText"
                    value={formData.linkText}
                    onChange={handleChange}
                    placeholder="Learn More"
                    maxLength={50}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Schedule (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                <Input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Announcement will activate at this time
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                <Input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Announcement will expire at this time
                </p>
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-foreground">
              Active (visible to users)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Announcement'}
          </Button>
          <Link href="/admin/announcements">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

