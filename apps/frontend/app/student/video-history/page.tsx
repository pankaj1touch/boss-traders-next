'use client';

import { useGetVideoHistoryQuery } from '@/store/api/courseApi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

export default function VideoHistoryPage() {
  const { data, isLoading } = useGetVideoHistoryQuery();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  const history = data?.history || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Video History</h1>
          <p className="text-muted-foreground mt-1">
            Continue watching from where you left off
          </p>
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No History Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start watching videos to see your history here
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => {
              const progressPercentage = item.duration > 0
                ? Math.round((item.maxWatchTime / item.duration) * 100)
                : 0;

              return (
                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <Link href={`/courses/${item.courseSlug}/learn?video=${item.videoId}&t=${Math.floor(item.maxWatchTime)}`}>
                      <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-12 w-12 text-white opacity-80" />
                        </div>
                        {progressPercentage > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        )}
                        {item.completed && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                        {item.videoTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.courseTitle}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatTime(item.maxWatchTime)} / {formatDuration(item.duration)}
                          </span>
                        </div>
                        <span>{item.views} {item.views === 1 ? 'view' : 'views'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.lastWatched), { addSuffix: true })}
                        </span>
                        <Link href={`/courses/${item.courseSlug}/learn?video=${item.videoId}&t=${Math.floor(item.maxWatchTime)}`}>
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}


