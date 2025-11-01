'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { ToastContainer } from '@/components/ui/Toast';
import { useAdminGetBlogsQuery, useDeleteBlogMutation } from '@/store/api/blogApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

export default function AdminBlogsPage() {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [publishStatus, setPublishStatus] = useState('');

  const { data, isLoading } = useAdminGetBlogsQuery({
    search,
    category: category || undefined,
    publishStatus: publishStatus || undefined,
    limit: 20,
  });

  const [deleteBlog] = useDeleteBlogMutation();

  const categories = [
    'technology',
    'business',
    'education',
    'lifestyle',
    'news',
    'tutorials',
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const result = await deleteBlog(id).unwrap();
        dispatch(addToast({ type: 'success', message: result.message || 'Blog deleted successfully' }));
      } catch (error: any) {
        console.error('Delete error:', error);
        const errorMessage = error?.data?.message || error?.message || 'Failed to delete blog';
        dispatch(addToast({ type: 'error', message: errorMessage }));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500 text-white">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />

      {/* Header */}
      <div className="border-b bg-white py-6 dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Blog Management</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your blog posts and content
              </p>
            </div>
            <Link href="/admin/blogs/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Blog Post
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-gray-50 py-4 dark:bg-gray-800">
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
              value={publishStatus}
              onChange={(e) => setPublishStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setCategory('');
                setPublishStatus('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className="py-8">
        <div className="container-custom">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : !data || !data.blogs || data.blogs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No blogs found. Create your first blog post!
              </p>
              <Link href="/admin/blogs/create">
                <Button className="mt-4">Create Blog Post</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.blogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        {blog.featuredImage && (
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={blog.featuredImage}
                              alt={blog.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="mb-2 flex items-center gap-2">
                            {getStatusBadge(blog.publishStatus)}
                            <Badge variant="secondary">
                              {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                            </Badge>
                            {blog.featured && (
                              <Badge className="bg-yellow-500 text-white">Featured</Badge>
                            )}
                          </div>

                          <h3 className="mb-1 truncate font-semibold">{blog.title}</h3>
                          <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                            {blog.excerpt}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>By {blog.author.name}</span>
                            <span>{formatDate(blog.createdAt)}</span>
                            <span>{blog.views} views</span>
                            <span>{blog.likes} likes</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/blog/${blog.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/blogs/${blog._id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(blog._id, blog.title)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
