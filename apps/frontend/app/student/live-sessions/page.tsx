'use client';

import { PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function LiveSessionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Live Sessions</h1>
        <p className="text-muted-foreground mt-1">Upcoming and past live classes</p>
      </div>

      {/* Empty State */}
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Live Sessions</h2>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have any scheduled live sessions. Check out our live classes schedule.
        </p>
        <Link href="/live">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium">
            View Schedule
          </button>
        </Link>
      </div>
    </div>
  );
}












