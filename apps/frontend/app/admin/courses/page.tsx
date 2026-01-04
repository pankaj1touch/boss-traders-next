'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminGetAllCoursesQuery, useAdminDeleteCourseMutation } from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CoursePreviewModal } from '@/components/CoursePreviewModal';
import { Edit2, Plus, Search, Trash2, Eye } from 'lucide-react';

export default function AdminCoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [previewCourseId, setPreviewCourseId] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminGetAllCoursesQuery({
    page,
    search: search || undefined,
    publishStatus: statusFilter || undefined,
  });

  const [deleteCourse] = useAdminDeleteCourseMutation();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteCourse(id).unwrap();
        alert('Course deleted successfully');
      } catch (error) {
        alert('Failed to delete course');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage all courses</p>
        </div>
        <Link href="/admin/courses/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading courses...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
          <p className="text-red-800 dark:text-red-200">Failed to load courses</p>
        </div>
      )}

      {/* Courses Table */}
      {!isLoading && !error && data && (
        <>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Videos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.courses.map((course) => (
                    <tr key={course._id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="cursor-pointer group" onClick={() => setPreviewCourseId(course._id)}>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            {course.title}
                            <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-xs text-muted-foreground">{course.instructorId?.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground capitalize">{course.category}</td>
                      <td className="px-6 py-4 text-sm text-foreground capitalize">{course.level}</td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {course.videos?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {course.salePrice ? (
                          <div>
                            <span className="line-through text-muted-foreground">₹{course.price}</span>
                            <span className="ml-2 font-semibold">₹{course.salePrice}</span>
                          </div>
                        ) : (
                          <span>₹{course.price}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            course.publishStatus === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : course.publishStatus === 'draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {course.publishStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/courses/${course._id}/edit`}>
                            <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(course._id, course.title)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {data.courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found</p>
              <Link href="/admin/courses/create">
                <Button className="mt-4">Create your first course</Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Course Preview Modal */}
      <CoursePreviewModal
        isOpen={!!previewCourseId}
        onClose={() => setPreviewCourseId(null)}
        courseId={previewCourseId || ''}
      />
    </div>
  );
}

