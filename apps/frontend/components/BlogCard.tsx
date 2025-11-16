'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock } from 'lucide-react';
import { Blog } from '@/store/api/blogApi';
import { Card, CardContent } from './ui/Card';
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
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <Card
        hover
        className="group h-full overflow-hidden transition-colors hover:border-primary-200 dark:hover:border-primary-900"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="relative h-64 overflow-hidden rounded-t-2xl sm:h-72 lg:h-64">
          {blog.featuredImage ? (
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              priority={index === 0}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-primary-200 to-secondary-200 text-primary-700 dark:from-primary-900/40 dark:to-secondary-900/40">
              <span className="text-sm font-semibold uppercase tracking-wide">Boss Traders</span>
            </div>
          )}
        </div>

        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {blog.category}
            </Badge>
            {blog.featured && <Badge className="bg-yellow-500/90 text-white">Featured</Badge>}
          </div>

          <h3 className="line-clamp-2 text-xl font-semibold text-foreground transition-colors group-hover:text-primary-600">
            {blog.title}
          </h3>

          <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{blog.excerpt}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-100 text-center text-xs font-semibold leading-8 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
                {blog.author?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span>{blog.author?.name ?? 'Unknown author'}</span>
            </div>

            <div className="flex items-center gap-3">
              {publishedDate && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {publishedDate}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {blog.readingTime || 5} min
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

