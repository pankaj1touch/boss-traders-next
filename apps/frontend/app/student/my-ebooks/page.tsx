'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import { useGetStudentEbooksQuery } from '@/store/api/studentApi';

export default function MyEbooksPage() {
  const { data, isLoading } = useGetStudentEbooksQuery();
  const ebooks = data?.ebooks ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Ebooks</h1>
        <p className="text-muted-foreground mt-1">Ebooks you have purchased</p>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          Loading your ebooks...
        </div>
      )}

      {!isLoading && ebooks.length === 0 && (
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
      )}

      {ebooks.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {ebooks.map((ebook) => (
            <div key={ebook._id} className="rounded-2xl border border-border bg-card p-6 flex gap-4">
              {ebook.cover ? (
                <div className="relative h-32 w-24 overflow-hidden rounded-xl">
                  <Image src={ebook.cover} alt={ebook.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-32 w-24 items-center justify-center rounded-xl bg-accent/40">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{ebook.title}</h3>
                  <p className="text-sm text-muted-foreground">by {ebook.author}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Purchased {ebook.purchasedAt ? format(new Date(ebook.purchasedAt), 'dd MMM yyyy') : '—'}
                </p>
                <p className="text-sm font-semibold text-foreground">{formatPrice(ebook.price)}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{ebook.format.toUpperCase()}</span>
                  {ebook.pages && <span>{ebook.pages} pages</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}












