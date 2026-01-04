'use client';

import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ToastContainer } from '@/components/ui/Toast';
import { useCreateSocialLinkMutation } from '@/store/api/socialLinkApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

const platforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export default function CreateSocialLinkPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createSocialLink, { isLoading }] = useCreateSocialLinkMutation();

  const [formData, setFormData] = useState({
    platform: 'facebook',
    url: '',
    isActive: true,
    order: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createSocialLink(formData as any).unwrap();
      dispatch(addToast({ type: 'success', message: 'Social link created successfully!' }));
      router.push('/admin/social-links');
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to create social link';
      dispatch(addToast({ type: 'error', message: errorMessage }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />

      {/* Header */}
      <div className="border-b bg-white py-6 dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center gap-4">
            <Link href="/admin/social-links">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Add Social Media Link</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add a new social media link to display in footer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="py-8">
        <div className="container-custom">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Social Link Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Platform */}
                <div>
                  <label htmlFor="platform" className="mb-2 block font-medium">
                    Platform *
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
                    required
                  >
                    {platforms.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URL */}
                <div>
                  <label htmlFor="url" className="mb-2 block font-medium">
                    URL *
                  </label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourpage"
                    required
                  />
                </div>

                {/* Order */}
                <div>
                  <label htmlFor="order" className="mb-2 block font-medium">
                    Display Order
                  </label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Lower numbers appear first (0 = first)
                  </p>
                </div>

                {/* Is Active */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                  <Link href="/admin/social-links">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}

