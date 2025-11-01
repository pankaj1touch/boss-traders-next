'use client';

import { useAppSelector } from '@/store/hooks';
import { BookOpen, FileText, PlayCircle, ShoppingBag, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      label: 'Enrolled Courses',
      value: 0,
      icon: BookOpen,
      href: '/student/my-courses',
      color: 'bg-blue-500',
    },
    {
      label: 'My Ebooks',
      value: 0,
      icon: FileText,
      href: '/student/my-ebooks',
      color: 'bg-green-500',
    },
    {
      label: 'Live Sessions',
      value: 0,
      icon: PlayCircle,
      href: '/student/live-sessions',
      color: 'bg-purple-500',
    },
    {
      label: 'Total Orders',
      value: 0,
      icon: ShoppingBag,
      href: '/student/orders',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}! 👋</h1>
        <p className="text-muted-foreground mt-1">Continue your learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="group cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:scale-105">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Continue Learning */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Continue Learning</h2>
            <Link href="/student/my-courses" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses in progress</p>
            <Link href="/courses">
              <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
                Browse Courses
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          </div>
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-2">Start learning to track your progress</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Achievements</h2>
        </div>
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No achievements yet</p>
          <p className="text-sm text-muted-foreground mt-2">Complete courses to earn badges</p>
        </div>
      </div>

      {/* Browse Content */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/courses">
          <div className="rounded-2xl border border-border bg-card p-6 text-center hover:shadow-lg transition-all cursor-pointer">
            <BookOpen className="h-10 w-10 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Browse Courses</h3>
            <p className="text-sm text-muted-foreground">Explore new courses</p>
          </div>
        </Link>
        
        <Link href="/ebooks">
          <div className="rounded-2xl border border-border bg-card p-6 text-center hover:shadow-lg transition-all cursor-pointer">
            <FileText className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Browse Ebooks</h3>
            <p className="text-sm text-muted-foreground">Discover new ebooks</p>
          </div>
        </Link>

        <Link href="/live">
          <div className="rounded-2xl border border-border bg-card p-6 text-center hover:shadow-lg transition-all cursor-pointer">
            <PlayCircle className="h-10 w-10 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Live Sessions</h3>
            <p className="text-sm text-muted-foreground">Join live classes</p>
          </div>
        </Link>
      </div>
    </div>
  );
}










