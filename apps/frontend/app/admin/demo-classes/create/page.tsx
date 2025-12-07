'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminCreateDemoClassMutation } from '@/store/api/adminApi';
import { useGetCoursesQuery } from '@/store/api/courseApi';
import { useGetInstructorsQuery } from '@/store/api/userApi';
import { useGetLocationsQuery } from '@/store/api/locationApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateDemoClassPage() {
  const router = useRouter();
  const [createDemoClass, { isLoading }] = useAdminCreateDemoClassMutation();
  const { data: coursesData } = useGetCoursesQuery({ limit: 100 });
  const { data: instructorsData } = useGetInstructorsQuery();
  const { data: locationsData } = useGetLocationsQuery();

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledAt: '',
    duration: '60',
    instructorId: '',
    maxAttendees: '20',
    locationId: '',
    meetingLink: '',
    price: '0',
    status: 'scheduled',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a demo class title');
      return;
    }
    if (!formData.courseId) {
      alert('Please select a course');
      return;
    }
    if (!formData.scheduledAt) {
      alert('Please select a scheduled date and time');
      return;
    }
    if (!formData.instructorId) {
      alert('Please enter instructor ID');
      return;
    }
    if (!formData.duration || Number(formData.duration) <= 0) {
      alert('Please enter a valid duration');
      return;
    }
    if (!formData.maxAttendees || Number(formData.maxAttendees) <= 0) {
      alert('Please enter a valid max attendees');
      return;
    }

    try {
      const demoClassData = {
        ...formData,
        courseId: formData.courseId || undefined,
        batchId: undefined,
        locationId: formData.locationId && formData.locationId.trim() ? formData.locationId : undefined,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: Number(formData.duration),
        maxAttendees: Number(formData.maxAttendees),
        instructorId: formData.instructorId,
        price: Number(formData.price) || 0,
        meetingLink: formData.meetingLink && formData.meetingLink.trim() ? formData.meetingLink : undefined,
      };

      await createDemoClass(demoClassData).unwrap();
      alert('Demo class created successfully!');
      router.push('/admin/demo-classes');
    } catch (error: any) {
      console.error('Demo class creation error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create demo class';
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/demo-classes">
          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Demo Class</h1>
          <p className="text-muted-foreground mt-1">Add a new demo class to the platform</p>
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
                  placeholder="e.g., Web Development Demo Class"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter demo class description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a course</option>
                  {coursesData?.courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Scheduling</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Scheduled Date & Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Attendees <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instructor & Location */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Instructor & Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Instructor <span className="text-red-500">*</span>
                </label>
                <select
                  name="instructorId"
                  value={formData.instructorId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select an instructor</option>
                  {instructorsData?.instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.name} ({instructor.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location (Optional)
                </label>
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a location (or leave empty for online)</option>
                  {locationsData?.locations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                      {location.address?.city && ` - ${location.address.city}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Meeting Link (Optional)
                </label>
                <Input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleChange}
                  placeholder="https://meet.example.com/..."
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Pricing</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price (INR) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter 0 for free demo classes, or set a price for paid demo classes
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Status</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/demo-classes">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Demo Class'}
          </Button>
        </div>
      </form>
    </div>
  );
}

