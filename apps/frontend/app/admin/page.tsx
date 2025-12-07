'use client';

import { useAdminGetAllCoursesQuery, useAdminGetAllEbooksQuery, useAdminGetDemoClassStatsQuery } from '@/store/api/adminApi';
import { BookOpen, BookText, TrendingUp, Users, Video, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: coursesData } = useAdminGetAllCoursesQuery({ limit: 5 });
  const { data: ebooksData } = useAdminGetAllEbooksQuery({ limit: 5 });
  const { data: demoClassStats } = useAdminGetDemoClassStatsQuery();

  const stats = [
    {
      label: 'Total Courses',
      value: coursesData?.pagination?.total || 0,
      icon: BookOpen,
      href: '/admin/courses',
      color: 'bg-blue-500',
    },
    {
      label: 'Total Ebooks',
      value: ebooksData?.pagination?.total || 0,
      icon: BookText,
      href: '/admin/ebooks',
      color: 'bg-green-500',
    },
    {
      label: 'Published Courses',
      value: coursesData?.courses?.filter((c) => c.publishStatus === 'published').length || 0,
      icon: TrendingUp,
      href: '/admin/courses?status=published',
      color: 'bg-purple-500',
    },
    {
      label: 'Published Ebooks',
      value: ebooksData?.ebooks?.filter((e) => e.publishStatus === 'published').length || 0,
      icon: Users,
      href: '/admin/ebooks?status=published',
      color: 'bg-orange-500',
    },
    {
      label: 'Total Demo Classes',
      value: demoClassStats?.totalDemoClasses || 0,
      icon: Video,
      href: '/admin/demo-classes',
      color: 'bg-indigo-500',
    },
    {
      label: 'Total Registrations',
      value: demoClassStats?.totalRegistrations || 0,
      icon: Users,
      href: '/admin/demo-classes/registrations',
      color: 'bg-teal-500',
    },
    {
      label: 'Pending Approvals',
      value: demoClassStats?.pendingRegistrations || 0,
      icon: Clock,
      href: '/admin/demo-classes/registrations?approvalStatus=pending',
      color: 'bg-yellow-500',
    },
    {
      label: 'Approved Registrations',
      value: demoClassStats?.approvedRegistrations || 0,
      icon: CheckCircle,
      href: '/admin/demo-classes/registrations?approvalStatus=approved',
      color: 'bg-green-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to the admin panel</p>
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

      {/* Recent Courses and Ebooks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Courses */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Recent Courses</h2>
            <Link href="/admin/courses" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {coursesData?.courses?.slice(0, 5).map((course) => (
              <div key={course._id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground">{course.category}</p>
                </div>
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    course.publishStatus === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : course.publishStatus === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  {course.publishStatus}
                </span>
              </div>
            ))}
            {(!coursesData?.courses || coursesData.courses.length === 0) && (
              <p className="text-center text-sm text-muted-foreground py-8">No courses yet</p>
            )}
          </div>
        </div>

        {/* Recent Ebooks */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Recent Ebooks</h2>
            <Link href="/admin/ebooks" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {ebooksData?.ebooks?.slice(0, 5).map((ebook) => (
              <div key={ebook._id} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ebook.title}</p>
                  <p className="text-xs text-muted-foreground">{ebook.author}</p>
                </div>
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    ebook.publishStatus === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : ebook.publishStatus === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  {ebook.publishStatus}
                </span>
              </div>
            ))}
            {(!ebooksData?.ebooks || ebooksData.ebooks.length === 0) && (
              <p className="text-center text-sm text-muted-foreground py-8">No ebooks yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}















