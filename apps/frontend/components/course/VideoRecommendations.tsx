'use client';

import { useGetRecommendedVideosQuery } from '@/store/api/courseApi';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Play, Clock, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function VideoRecommendations() {
  const { data, isLoading } = useGetRecommendedVideosQuery({ limit: 6 });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading recommendations...</div>
        </CardContent>
      </Card>
    );
  }

  const recommendations = data?.recommendations || [];
  const type = data?.type || 'popular';

  if (recommendations.length === 0) {
    return null;
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {type === 'personalized' ? 'Recommended for You' : 'Popular Courses'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((course: any) => (
            <Link
              key={course._id}
              href={`/courses/${course.slug}`}
              className="group"
            >
              <div className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {course.price === 0 ? (
                      <span className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded">
                        Free
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold bg-primary text-white rounded">
                        ₹{course.price}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  {course.instructorId && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {course.instructorId.name}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {course.totalDuration && (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(course.totalDuration)}</span>
                        </>
                      )}
                    </div>
                    {course.level && (
                      <span className="px-2 py-0.5 rounded bg-muted text-foreground">
                        {course.level}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


