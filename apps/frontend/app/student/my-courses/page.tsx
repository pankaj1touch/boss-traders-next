'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground mt-1">Courses you are enrolled in</p>
      </div>

      {/* Empty State */}
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Courses Yet</h2>
        <p className="text-muted-foreground mb-6">
          You haven&apos;t enrolled in any courses yet. Browse our course catalog to get started.
        </p>
        <Link href="/courses">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium">
            Browse Courses
          </button>
        </Link>
      </div>
    </div>
  );
}










