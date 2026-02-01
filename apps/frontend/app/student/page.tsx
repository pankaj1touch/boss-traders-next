'use client';

import Link from 'next/link';
import { BookOpen, FileText, PlayCircle, ShoppingBag, TrendingUp, Award } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useGetStudentStatsQuery } from '@/store/api/studentApi';

export default function StudentDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetStudentStatsQuery();

  const stats = [
    {
      label: 'Enrolled Courses',
      value: data?.stats.enrolledCourses ?? 0,
      icon: BookOpen,
      href: '/student/my-courses',
      color: 'bg-blue-500',
    },
    {
      label: 'My Ebooks',
      value: data?.stats.ebooks ?? 0,
      icon: FileText,
      href: '/student/my-ebooks',
      color: 'bg-green-500',
    },
    {
      label: 'Live Sessions',
      value: data?.stats.liveSessions ?? 0,
      icon: PlayCircle,
      href: '/student/live-sessions',
      color: 'bg-purple-500',
    },
    {
      label: 'Total Orders',
      value: data?.stats.totalOrders ?? 0,
      icon: ShoppingBag,
      href: '/student/orders',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Continue your learning journey
        </p>
      </div>

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="group cursor-pointer rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 transition-all hover:shadow-lg active:scale-[0.98] lg:hover:scale-105">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl ${stat.color} text-white shrink-0`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {isLoading ? '...' : stat.value}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Continue Learning & Recent Activity */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Continue Learning</h2>
            <Link href="/student/my-courses" className="text-xs sm:text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <p className="text-muted-foreground text-sm sm:text-base">
              {stats[0].value > 0 ? 'Pick up where you left off' : 'No courses in progress'}
            </p>
            <Link href={stats[0].value > 0 ? '/student/my-courses' : '/courses'}>
              <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm sm:text-base">
                {stats[0].value > 0 ? 'Open My Courses' : 'Browse Courses'}
              </button>
            </Link>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Recent Activity</h2>
          </div>
          <div className="text-center py-8 sm:py-12">
            <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <p className="text-muted-foreground text-sm sm:text-base">No recent activity</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">Start learning to track your progress</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Achievements</h2>
        </div>
        <div className="text-center py-8 sm:py-12">
          <Award className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">No achievements yet</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Complete courses to earn badges</p>
        </div>
      </div>

      {/* Quick Actions - Horizontal scroll on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Link href="/courses">
          <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-6 text-center hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-xs sm:text-base">Courses</h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block">Explore new courses</p>
          </div>
        </Link>

        <Link href="/ebooks">
          <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-6 text-center hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-xs sm:text-base">Ebooks</h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block">Discover new ebooks</p>
          </div>
        </Link>

        <Link href="/live">
          <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-6 text-center hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]">
            <PlayCircle className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-xs sm:text-base">Live</h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block">Join live classes</p>
          </div>
        </Link>
      </div>
    </div>
  );
}












