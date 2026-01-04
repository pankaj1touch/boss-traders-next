'use client';

import { useState } from 'react';
import { BarChart3, Clock, CheckCircle2, BookOpen, TrendingUp, Calendar, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useGetStudentVideoAnalyticsQuery } from '@/store/api/courseApi';
import Link from 'next/link';
import Image from 'next/image';

export default function StudentAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30');
  const { data, isLoading } = useGetStudentVideoAnalyticsQuery({ timeRange });

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-12">
          <div className="text-center text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const watchTimeByDay = data?.watchTimeByDay || [];
  const topCourses = data?.topCourses || [];
  const recentActivity = data?.recentActivity || [];
  const enrollments = data?.enrollments || [];

  const maxWatchTime = Math.max(...watchTimeByDay.map((d: any) => d.watchTime), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Learning Analytics</h1>
            <p className="text-muted-foreground">Track your progress and learning insights</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Videos Watched</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalVideosWatched || 0}</p>
                </div>
                <Play className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Watch Time</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatDuration(stats.totalWatchTime || 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Videos Completed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalCompletions || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Courses in Progress</p>
                  <p className="text-2xl font-bold text-foreground">{stats.coursesInProgress || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Watch Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Watch Time Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {watchTimeByDay.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No watch time data available
                </div>
              ) : (
                <div className="space-y-2">
                  {watchTimeByDay.map((day: any, index: number) => {
                    const percentage = maxWatchTime > 0 ? (day.watchTime / maxWatchTime) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-24">
                          {formatDate(day._id)}
                        </span>
                        <div className="flex-1 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                          <div
                            className="h-full bg-primary transition-all duration-300 flex items-center justify-end pr-2"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-xs font-medium text-white">
                              {formatDuration(day.watchTime)}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {day.videos.length} videos
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCourses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No course data available</div>
              ) : (
                <div className="space-y-3">
                  {topCourses.map((item: any, index: number) => (
                    <Link
                      key={item.course?._id || index}
                      href={`/courses/${item.course?.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      {item.course?.thumbnail && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.course.thumbnail}
                            alt={item.course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{item.course?.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{formatDuration(item.watchTime)}</span>
                          <span>•</span>
                          <span>{item.videosWatched} videos</span>
                          {item.completions > 0 && (
                            <>
                              <span>•</span>
                              <span>{item.completions} completed</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No recent activity</div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity: any, index: number) => (
                  <div
                    key={activity._id || index}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border"
                  >
                    {activity.courseId?.thumbnail && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={activity.courseId.thumbnail}
                          alt={activity.courseId.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/courses/${activity.courseId?.slug}/learn`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {activity.courseId?.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{formatDuration(activity.watchTime || 0)}</span>
                        {activity.completed && (
                          <>
                            <span>•</span>
                            <Badge variant="success" className="text-xs">Completed</Badge>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(activity.lastWatched).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Progress */}
        {enrollments.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>My Courses Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.map((enrollment: any, index: number) => (
                  <Link
                    key={enrollment.course?._id || index}
                    href={`/courses/${enrollment.course?.slug}/learn`}
                    className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {enrollment.course?.thumbnail && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={enrollment.course.thumbnail}
                            alt={enrollment.course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-2">{enrollment.course?.title}</h3>
                        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <span>{enrollment.progress || 0}% Complete</span>
                          <span>
                            {enrollment.videoProgress?.filter((p: any) => p.completed).length || 0} videos
                            completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}


