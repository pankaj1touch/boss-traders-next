'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, User, Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetBlogsQuery } from '@/store/api/blogApi';

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'featured' | 'newest' | 'oldest' | 'popular'>('newest');
  const [featured, setFeatured] = useState<boolean | undefined>(undefined);

  const { data, isLoading, error } = useGetBlogsQuery({
    search,
    category: category || undefined,
    featured,
    sort: sort as 'featured' | 'newest' | 'oldest' | 'popular',
    limit: 12,
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

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setSort('newest');
    setFeatured(undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-20 text-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-4 text-5xl font-bold">Blog</h1>
            <p className="text-xl opacity-90">
              Stay updated with the latest insights, tutorials, and industry news
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="border-b bg-gray-50 py-8 dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'featured' | 'newest' | 'oldest' | 'popular')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <Button
                variant={featured === true ? 'primary' : 'outline'}
                onClick={() => setFeatured(featured === true ? undefined : true)}
                className="flex-1"
              >
                Featured
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-xl text-red-600 dark:text-red-400">
                Error loading blogs. Please try again later.
              </p>
            </div>
          ) : !data || !data.blogs || data.blogs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No blogs found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">
                  {data?.pagination.total} blogs found
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {data?.blogs.map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/blog/${blog.slug}`}>
                      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                        {blog.featuredImage && (
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={blog.featuredImage}
                              alt={blog.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div className="mb-3 flex items-center gap-2">
                            <Badge variant="secondary">
                              {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                            </Badge>
                            {blog.featured && (
                              <Badge className="bg-yellow-500 text-white">Featured</Badge>
                            )}
                          </div>

                          <h3 className="mb-2 line-clamp-2 font-bold text-lg group-hover:text-primary-600">
                            {blog.title}
                          </h3>

                          <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-400">
                            {blog.excerpt}
                          </p>

                          <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{blog.author.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(blog.publishedAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{blog.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{blog.likes}</span>
                              </div>
                              <span>{blog.readingTime} min read</span>
                            </div>
                          </div>

                          {blog.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1">
                              {blog.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {blog.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{blog.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {data?.pagination.pages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex gap-2">
                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === data.pagination.page ? 'primary' : 'outline'}
                        size="sm"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
