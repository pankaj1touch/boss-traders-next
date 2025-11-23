'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useAdminGetBannerQuery,
  useAdminUpdateBannerMutation,
} from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const bannerId = params.id as string;

  const { data, isLoading: isLoadingBanner, error } = useAdminGetBannerQuery(bannerId);
  const [updateBanner, { isLoading: isUpdating }] = useAdminUpdateBannerMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    if (data?.banner) {
      setFormData({
        title: data.banner.title,
        description: data.banner.description,
        imageUrl: data.banner.imageUrl,
        isActive: data.banner.isActive,
        order: data.banner.order,
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter a banner title' }));
      return;
    }
    if (!formData.description.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter a banner description' }));
      return;
    }
    if (!formData.imageUrl.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please upload a banner image' }));
      return;
    }

    try {
      await updateBanner({ id: bannerId, data: formData }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Banner updated successfully!' }));
      router.push('/admin/banners');
    } catch (error: any) {
      console.error('Banner update error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update banner';
      dispatch(addToast({ type: 'error', message: errorMessage }));
    }
  };

  if (isLoadingBanner) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-muted-foreground mt-4">Loading banner...</p>
      </div>
    );
  }

  if (error || !data?.banner) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
        <p className="text-red-800 dark:text-red-200">Failed to load banner</p>
        <Link href="/admin/banners">
          <Button variant="outline" className="mt-4">
            Back to Banners
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/banners">
          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Banner</h1>
          <p className="text-muted-foreground mt-1">Update banner information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Banner Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter banner title"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Enter banner description"
                  maxLength={1000}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Banner Image <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  type="blog"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Display Order</label>
                  <Input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower numbers appear first
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                    Active (visible on homepage)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Banner'}
          </Button>
          <Link href="/admin/banners">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

