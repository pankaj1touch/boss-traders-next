'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock, ArrowUpRight } from 'lucide-react';
import { Blog } from '@/store/api/blogApi';
import { Badge } from './ui/Badge';

interface BlogCardProps {
  blog: Blog;
  index?: number;
}

export function BlogCard({ blog, index = 0 }: BlogCardProps) {
  const publishedDate = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '';

  return (
    <Link
      href={`/blog/${blog.slug}`}
      aria-label={`Read blog post: ${blog.title}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Gradient border wrapper for a premium edge */}
      <div className="h-full bg-gradient-to-b from-gray-200/70 to-gray-100/40 p-[1px] transition-all duration-300 group-hover:from-primary-400/70 group-hover:to-secondary-400/40 dark:from-white/10 dark:to-white/[0.02] dark:group-hover:from-primary-500/50 dark:group-hover:to-secondary-500/30">
        <article className="flex h-full flex-col overflow-hidden bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-primary-500/10 dark:bg-brand-navy/60 dark:backdrop-blur-md">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-950">
            {blog.featuredImage ? (
              <>
                {/* Blurred backdrop fills empty space so image is never cropped */}
                <Image
                  src={blog.featuredImage}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="scale-125 object-cover opacity-50 blur-2xl"
                />
                {/* Full image — object-contain never crops any side */}
                <Image
                  src={blog.featuredImage}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  priority={index === 0}
                />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-200 to-secondary-200 text-primary-700 dark:from-primary-900/40 dark:to-secondary-900/40">
                <span className="text-sm font-semibold uppercase tracking-wide">Boss Traders</span>
              </div>
            )}

            {/* Floating badges */}
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="border-white/20 bg-white/80 capitalize text-gray-800 shadow-sm backdrop-blur-md dark:bg-black/40 dark:text-white"
              >
                {blog.category}
              </Badge>
              {blog.featured && (
                <Badge className="bg-yellow-500/90 text-white shadow-sm backdrop-blur-md">Featured</Badge>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col space-y-3 p-6">
            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary-600 sm:text-xl">
              {blog.title}
            </h3>

            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {blog.excerpt}
            </p>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-muted-foreground dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-xs font-semibold text-white shadow-sm">
                  {blog.author?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="font-medium text-foreground/80">{blog.author?.name ?? 'Unknown author'}</span>
              </div>

              <div className="flex items-center gap-3">
                {publishedDate && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {publishedDate}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {blog.readingTime || 5} min
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition-all duration-300 group-hover:gap-1.5">
              Read article
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </article>
      </div>
    </Link>
  );
}
