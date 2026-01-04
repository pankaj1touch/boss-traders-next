'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { ToastContainer } from '@/components/ui/Toast';
import { 
  useAdminGetPageContentByIdQuery, 
  useUpdatePageContentMutation 
} from '@/store/api/pageContentApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

const pageTypeLabels: Record<string, string> = {
  about: 'About Us',
  contact: 'Contact',
  careers: 'Careers',
};

export default function EditPageContentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const dispatch = useAppDispatch();

  const { data, isLoading: isLoadingData } = useAdminGetPageContentByIdQuery(id);
  const [updatePageContent, { isLoading }] = useUpdatePageContentMutation();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
  });

  useEffect(() => {
    if (data?.pageContent) {
      const page = data.pageContent;
      setFormData({
        title: page.title || '',
        content: page.content || '',
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        isActive: page.isActive ?? true,
      });
    }
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updatePageContent({ id, data: formData }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Page content updated successfully!' }));
      router.push('/admin/page-content');
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update page content';
      dispatch(addToast({ type: 'error', message: errorMessage }));
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const pageContent = data?.pageContent;
  if (!pageContent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="text-center">Page content not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />

      {/* Header */}
      <div className="border-b bg-white py-6 dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center gap-4">
            <Link href="/admin/page-content">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                Edit {pageTypeLabels[pageContent.pageType] || pageContent.pageType}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Update page content
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
                  <CardTitle>Page Content</CardTitle>
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
                      placeholder="Enter page title"
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label htmlFor="content" className="mb-2 block font-medium">
                      Content *
                    </label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      placeholder="Enter page content"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="metaTitle" className="mb-2 block text-sm font-medium">
                      Meta Title
                    </label>
                    <Input
                      id="metaTitle"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      placeholder="SEO title"
                    />
                  </div>

                  <div>
                    <label htmlFor="metaDescription" className="mb-2 block text-sm font-medium">
                      Meta Description
                    </label>
                    <textarea
                      id="metaDescription"
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      placeholder="SEO description"
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href="/admin/page-content">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

