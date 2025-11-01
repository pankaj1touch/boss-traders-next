'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImageUpload from '@/components/ui/ImageUpload';
import { ToastContainer } from '@/components/ui/Toast';
import { useCreateBlogMutation } from '@/store/api/blogApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

export default function CreateBlogPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createBlog, { isLoading }] = useCreateBlogMutation();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: 'technology',
    tags: '',
    publishStatus: 'draft',
    featured: false,
    seoTitle: '',
    seoDescription: '',
  });

  const categories = [
    'technology',
    'business',
    'education',
    'lifestyle',
    'news',
    'tutorials',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      await createBlog(blogData).unwrap();
      dispatch(addToast({ type: 'success', message: 'Blog created successfully!' }));
      router.push('/admin/blogs');
    } catch (error) {
      dispatch(addToast({ type: 'error', message: 'Failed to create blog' }));
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    dispatch(addToast({ type: 'info', message: 'Preview functionality coming soon' }));
  };

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />

      {/* Header */}
      <div className="border-b bg-white py-6 dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center gap-4">
            <Link href="/admin/blogs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Create Blog Post</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Write and publish a new blog post
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="py-8">
        <div className="container-custom">
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Blog Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="mb-2 block font-medium">
                      Title *
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog title"
                      required
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label htmlFor="excerpt" className="mb-2 block font-medium">
                      Excerpt *
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Enter blog excerpt (max 300 characters)"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
                      rows={3}
                      maxLength={300}
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.excerpt.length}/300 characters
                    </p>
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="mb-2 block font-medium">
                      Featured Image
                    </label>
                    <ImageUpload
                      value={formData.featuredImage}
                      onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="mb-2 block font-medium">
                      Content *
                    </label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      placeholder="Write your blog content here..."
                      className="min-h-[400px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="category" className="mb-2 block font-medium">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="publishStatus" className="mb-2 block font-medium">
                      Status
                    </label>
                    <select
                      id="publishStatus"
                      name="publishStatus"
                      value={formData.publishStatus}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="featured" className="font-medium">
                      Featured Post
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label htmlFor="tags" className="mb-2 block font-medium">
                      Tags (comma separated)
                    </label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Separate tags with commas
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="seoTitle" className="mb-2 block font-medium">
                      SEO Title
                    </label>
                    <Input
                      id="seoTitle"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      placeholder="SEO optimized title"
                      maxLength={60}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.seoTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="seoDescription" className="mb-2 block font-medium">
                      SEO Description
                    </label>
                    <textarea
                      id="seoDescription"
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      placeholder="SEO optimized description"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.seoDescription.length}/160 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  className="flex-1 gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Creating...' : 'Create Blog'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
