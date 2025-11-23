'use client';

import { useAdminGetCourseQuery } from '@/store/api/adminApi';
import { Modal } from './ui/Modal';
import { BookOpen, Calendar, DollarSign, Globe, Star, Users, Clock } from 'lucide-react';

interface CoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export function CoursePreviewModal({ isOpen, onClose, courseId }: CoursePreviewModalProps) {
  const { data, isLoading } = useAdminGetCourseQuery(courseId, {
    skip: !isOpen,
  });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Course Preview" size="xl">
      {isLoading ? (
        <div className="p-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading course details...</p>
        </div>
      ) : data?.course ? (
        <div className="p-6 space-y-6">
          {/* Course Header */}
          <div className="flex items-start gap-6">
            {data.course.thumbnail && (
              <img
                src={data.course.thumbnail}
                alt={data.course.title}
                className="w-32 h-24 object-cover rounded-xl"
              />
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-2">{data.course.title}</h3>
              <p className="text-muted-foreground mb-4">{data.course.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {data.course.category}
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {data.course.language}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {data.enrollmentCount || 0} enrollments
                </div>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Course Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-medium capitalize">{data.course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modality:</span>
                  <span className="font-medium capitalize">{data.course.modality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    data.course.publishStatus === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : data.course.publishStatus === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {data.course.publishStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(data.course.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & Stats */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Pricing & Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium text-lg">
                    {data.course.salePrice ? (
                      <div>
                        <span className="line-through text-muted-foreground">₹{data.course.price}</span>
                        <span className="ml-2 text-primary">₹{data.course.salePrice}</span>
                      </div>
                    ) : (
                      `₹${data.course.price}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{data.course.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({data.course.ratingCount})</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modules:</span>
                  <span className="font-medium">{data.modules?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lessons:</span>
                  <span className="font-medium">{data.lessons?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {data.course.tags && data.course.tags.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {data.course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          {data.course.outcomes && data.course.outcomes.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Learning Outcomes</h4>
              <ul className="space-y-2">
                {data.course.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-foreground">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {data.course.prerequisites && data.course.prerequisites.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Prerequisites</h4>
              <ul className="space-y-2">
                {data.course.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-foreground">{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructor */}
          {data.course.instructorId && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Instructor</h4>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {data.course.instructorId.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{data.course.instructorId.name}</p>
                  <p className="text-sm text-muted-foreground">{data.course.instructorId.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Course not found</p>
        </div>
      )}
    </Modal>
  );
}














