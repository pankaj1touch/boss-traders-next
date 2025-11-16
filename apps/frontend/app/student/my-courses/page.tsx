'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Play } from 'lucide-react';
import { useGetStudentCoursesQuery } from '@/store/api/studentApi';
import { format } from 'date-fns';

export default function MyCoursesPage() {
  const { data, isLoading } = useGetStudentCoursesQuery();
  const courses = data?.courses ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground mt-1">Courses you are enrolled in</p>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          Loading your courses...
        </div>
      )}

      {!isLoading && courses.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl nav font-semibold text-foreground mb-2">No Courses Yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t enrolled in any courses yet. Browse our course catalog to get started.
          </p>
          <Link href="/courses">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium">
              Browse Courses
            </button>
          </Link>
        </div>
      )}

      {courses.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((item) => (
            <div key={item.enrollmentId} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col md:flex-row">
              {item.course.thumbnail ? (
                <div className="relative w-full md:w-48 h-40 md:h-auto">
                  <Image src={item.course.thumbnail} alt={item.course.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex w-full md:w-48 items-center justify-center bg-accent/40">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-sm uppercase text-muted-foreground tracking-wide">{item.course.level}</p>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{item.course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Enrolled {format(new Date(item.enrolledAt), 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Progress</p>
                    <div className="h-2 w-32 rounded-full bg-accent/50 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.progress}% completed</p>
                  </div>
                  <Link href={`/courses/${item.course.slug}`}>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      <Play className="h-4 w-4" />
                      Continue
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}












