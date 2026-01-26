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
    <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-brand-navy/50">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="h-8 w-1 bg-brand-gold rounded-full" />
          <TrendingUp className="h-5 w-5 text-brand-gold" />
          {type === 'personalized' ? 'Recommended for You' : 'You Might Also Like'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((course: any) => (
          <Link
            key={course._id}
            href={`/courses/${course.slug}`}
            className="group block"
          >
            <div className="glass-card h-full rounded-2xl border border-white/5 bg-white/5 overflow-hidden hover:shadow-neon transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="relative aspect-video bg-black/40 overflow-hidden">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-navy">
                    <Play className="h-12 w-12 text-white/20" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />

                <div className="absolute top-3 right-3">
                  {course.price === 0 ? (
                    <span className="px-3 py-1 text-xs font-bold bg-green-500/90 text-white rounded-full backdrop-blur-sm shadow-lg">
                      Free
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold bg-brand-blue/90 text-white rounded-full backdrop-blur-sm shadow-lg">
                      ₹{course.price}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {course.level && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-gray-300 border border-white/10">
                      {course.level}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500">•</span>
                  <span className="text-[10px] text-gray-400">{course.category}</span>
                </div>

                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center justify-between mt-4 text-xs text-gray-400 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-1.5">
                    {course.instructorId && (
                      <span className="hover:text-white transition-colors">{course.instructorId.name}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {course.totalDuration && (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(course.totalDuration)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


