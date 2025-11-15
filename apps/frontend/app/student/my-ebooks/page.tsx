'use client';

import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function MyEbooksPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Ebooks</h1>
        <p className="text-muted-foreground mt-1">Ebooks you have purchased</p>
      </div>

      {/* Empty State */}
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Ebooks Yet</h2>
        <p className="text-muted-foreground mb-6">
          You haven&apos;t purchased any ebooks yet. Browse our ebook collection to get started.
        </p>
        <Link href="/ebooks">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium">
            Browse Ebooks
          </button>
        </Link>
      </div>
    </div>
  );
}












