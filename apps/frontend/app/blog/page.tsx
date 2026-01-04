'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  User,
  Eye,
  Heart,
  Sparkles,
  Flame,
  LayoutGrid,
  Rows,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { Blog, useGetBlogsQuery } from '@/store/api/blogApi';
import { BlogCard } from '@/components/BlogCard';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type Timeframe = 'anytime' | 'week' | 'month' | 'year';

const timeframeConfig: Record<Exclude<Timeframe, 'anytime'>, number> = {
  week: 7,
  month: 30,
  year: 365,
};

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'featured' | 'newest' | 'oldest' | 'popular'>('newest');
  const [featured, setFeatured] = useState<boolean | undefined>(undefined);
  const [activeTag, setActiveTag] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [timeframe, setTimeframe] = useState<Timeframe>('anytime');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetBlogsQuery({
    search,
    category: category || undefined,
    featured,
    sort,
    limit: 12,
    tag: activeTag || undefined,
    page,
  });

  const categories = [
    'technology',
    'business',
    'education',
    'lifestyle',
    'news',
    'tutorials',
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'featured', label: 'Featured' },
  ];

  const blogs = useMemo(() => data?.blogs ?? [], [data?.blogs]);

  const timeframeFilteredBlogs = useMemo(() => {
    if (!blogs.length) return [];
    if (timeframe === 'anytime') return blogs;

    const thresholdDays = timeframeConfig[timeframe];
    const now = Date.now();

    return blogs.filter((blog) => {
      const published = new Date(blog.publishedAt).getTime();
      const diffDays = (now - published) / (1000 * 60 * 60 * 24);
      return diffDays <= thresholdDays;
    });
  }, [blogs, timeframe]);

  const featuredBlog = useMemo(
    () => blogs.find((blog) => blog.featured) ?? blogs[0],
    [blogs],
  );
  const featuredBlogId = featuredBlog?._id;

  const highlightBlogs = useMemo(
    () => blogs.filter((blog) => blog._id !== featuredBlogId).slice(0, 3),
    [blogs, featuredBlogId],
  );

  const tagFrequency = useMemo(() => {
    const freq = new Map<string, number>();
    blogs.forEach((blog) => {
      blog.tags.forEach((tag) => {
        freq.set(tag, (freq.get(tag) || 0) + 1);
      });
    });
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [blogs]);

  const totalViews = useMemo(
    () => blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
    [blogs],
  );

  const averageReadTime = useMemo(() => {
    if (!blogs.length) return 0;
    const total = blogs.reduce((sum, blog) => sum + (blog.readingTime || 0), 0);
    return Math.round(total / blogs.length);
  }, [blogs]);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setSort('newest');
    setFeatured(undefined);
    setActiveTag('');
    setTimeframe('anytime');
    setViewMode('grid');
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleViewToggle = (mode: ViewMode) => setViewMode(mode);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderListItem = (blog: Blog) => (
    <Link
      key={blog._id}
      href={`/blog/${blog.slug}`}
      className="relative flex flex-col gap-6 rounded-3xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-xl dark:bg-gray-900/80 md:flex-row"
    >
      <div className="relative h-52 overflow-hidden rounded-2xl md:h-48 md:w-60">
        {blog.featuredImage ? (
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500/30 to-secondary-500/30 text-primary-900 dark:text-primary-100">
            <span className="text-sm font-semibold uppercase">Boss Traders</span>
          </div>
        )}
        {blog.featured && (
          <Badge className="absolute left-4 top-4 bg-yellow-400 text-black shadow-lg">Featured</Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary" className="capitalize">
            {blog.category}
          </Badge>
          {blog.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-muted text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        <h3 className="text-2xl font-semibold leading-snug text-foreground">{blog.title}</h3>
        <p className="line-clamp-3 text-base text-muted-foreground">{blog.excerpt}</p>

        <div className="mt-auto flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {blog.author.name}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(blog.publishedAt)}
          </span>
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {blog.views} reads
          </span>
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {blog.likes}
          </span>
          <span>{blog.readingTime} min read</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ToastContainer />

      {/* Immersive hero */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
        </div>
        <div className="container-custom relative z-10 grid gap-10 py-16 text-white lg:grid-cols-[1.3fr_0.8fr] lg:gap-16">
          <div className="space-y-6">
            <Badge className="bg-white/10 text-white backdrop-blur">Boss Traders Journal</Badge>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Stay ahead with actionable trading intelligence
            </h1>
            <p className="text-lg text-white/80 lg:text-xl">
              Curated playbooks, trading psychology, and business systems from industry experts.
              Discover featured deep dives, trending narratives, and practical tutorials.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm text-white/60">Published insights</p>
                <p className="text-3xl font-semibold">{data?.pagination.total ?? 0}+</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm text-white/60">Community reads</p>
                <p className="text-3xl font-semibold">{totalViews.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm text-white/60">Avg. read time</p>
                <p className="text-3xl font-semibold">{averageReadTime || 5} min</p>
              </div>
            </div>
          </div>

          {featuredBlog ? (
            <Link
              href={`/blog/${featuredBlog.slug}`}
              className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-primary-500/30 backdrop-blur lg:min-h-[480px]"
            >
              <div className="relative h-64 w-full overflow-hidden">
                {featuredBlog.featuredImage ? (
                  <Image
                    src={featuredBlog.featuredImage}
                    alt={featuredBlog.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-500/30 text-white/90">
                    Boss Traders
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span className="uppercase tracking-[0.2em] text-xs text-white/70">
                    Spotlight
                  </span>
                </div>
                <h3 className="text-2xl font-semibold leading-snug text-white">{featuredBlog.title}</h3>
                <p className="line-clamp-3 text-white/80">{featuredBlog.excerpt}</p>
                <div className="mt-auto flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {featuredBlog.author.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featuredBlog.publishedAt)}
                  </span>
                  <span>{featuredBlog.readingTime} min read</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
              Curated features arrive here once blogs are published.
            </div>
          )}
        </div>
      </section>

      {/* Search and filters */}
      <section className="border-b border-border/40 bg-muted/30 py-8">
        <div className="container-custom space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search stories, authors, or tags..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-12 rounded-2xl border-0 bg-card pl-12 shadow-sm"
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="h-12 rounded-2xl border-0 bg-card px-4 text-sm capitalize text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as 'featured' | 'newest' | 'oldest' | 'popular');
                setPage(1);
              }}
              className="h-12 rounded-2xl border-0 bg-card px-4 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {(['anytime', 'week', 'month', 'year'] as Timeframe[]).map((frame) => (
                <button
                  key={frame}
                  onClick={() => {
                    setTimeframe(frame);
                    setPage(1);
                  }}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition-colors',
                    timeframe === frame
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/10'
                      : 'border-border bg-transparent text-muted-foreground hover:border-primary-300 hover:text-primary-700 dark:hover:border-primary-700',
                  )}
                >
                  {frame === 'anytime' ? 'Anytime' : `Last ${frame}`}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={featured ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setFeatured(featured ? undefined : true);
                  setPage(1);
                }}
              >
                <Flame className="mr-2 h-4 w-4" />
                Featured only
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset filters
              </Button>
            </div>
          </div>

          {tagFrequency.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card/70 p-4">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Tag className="h-4 w-4" />
                Trending tags
              </span>
              {tagFrequency.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => {
                    setActiveTag((prev) => (prev === tag ? '' : tag));
                    setPage(1);
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-colors',
                    activeTag === tag
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30'
                      : 'border-transparent bg-muted/40 text-muted-foreground hover:border-primary-200 hover:text-primary-600',
                  )}
                >
                  #{tag} · {count}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container-custom grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {isLoading ? (
              <div className={cn('gap-6', viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col')}>
                {[...Array(viewMode === 'grid' ? 6 : 4)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-72 animate-pulse rounded-3xl bg-muted/60 dark:bg-muted/30"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-red-700 dark:border-red-800/50 dark:bg-red-900/10">
                We hit a snag while loading insights. Please refresh or try again later.
              </div>
            ) : !timeframeFilteredBlogs.length ? (
              <div className="rounded-3xl border border-dashed border-muted-foreground/30 p-12 text-center">
                <p className="text-xl font-semibold">No stories found</p>
                <p className="mt-2 text-muted-foreground">
                  Adjust filters or reset to explore the full knowledge base.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-semibold text-foreground">{timeframeFilteredBlogs.length}</span>{' '}
                    curated insights
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleViewToggle('grid')}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleViewToggle('list')}
                      aria-label="List view"
                    >
                      <Rows className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {timeframeFilteredBlogs.map((blog, index) => (
                      <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <BlogCard blog={blog} index={index} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {timeframeFilteredBlogs.map((blog) => renderListItem(blog))}
                  </div>
                )}

                {data?.pagination.pages && data.pagination.pages > 1 && (
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((pg) => (
                      <Button
                        key={pg}
                        variant={pg === data.pagination.page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pg)}
                      >
                        {pg}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="space-y-6 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur dark:bg-gray-900/60">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-4 w-4 text-primary-500" />
                Editor&apos;s radar
              </h4>
              <p className="text-sm text-muted-foreground">
                Weekly shortlist of narratives driving momentum across the Boss Traders ecosystem.
              </p>
            </div>

            <div className="space-y-4">
              {highlightBlogs.length ? (
                highlightBlogs.map((blog) => (
                  <Link
                    key={blog._id}
                    href={`/blog/${blog.slug}`}
                    className="group flex gap-4 rounded-2xl border border-border/40 p-4 transition-all hover:border-primary-200 hover:bg-primary-50/40 dark:hover:bg-primary-900/10"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-muted">
                      {blog.featuredImage ? (
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="64px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                          Boss
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-semibold">{blog.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(blog.publishedAt)} • {blog.readingTime} min read
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Featured picks will appear shortly.</p>
              )}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white shadow-lg">
              <p className="text-sm uppercase tracking-wide text-white/80">Never miss a drop</p>
              <h5 className="mt-2 text-xl font-semibold">Get trading insights in your inbox</h5>
              <p className="mt-2 text-sm text-white/80">
                Subscribe to weekly digests with curated strategies, explainers, and launch alerts.
              </p>
              <Button variant="secondary" className="mt-4 w-full bg-white text-primary-700 hover:bg-white/90">
                Join newsletter
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
