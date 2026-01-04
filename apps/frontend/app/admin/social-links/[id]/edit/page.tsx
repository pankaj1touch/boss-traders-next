'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ToastContainer } from '@/components/ui/Toast';
import { 
  useAdminGetAllSocialLinksQuery, 
  useUpdateSocialLinkMutation 
} from '@/store/api/socialLinkApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

export default function EditSocialLinkPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const dispatch = useAppDispatch();

  const { data } = useAdminGetAllSocialLinksQuery();
  const [updateSocialLink, { isLoading }] = useUpdateSocialLinkMutation();

  const socialLink = data?.socialLinks?.find(link => link._id === id);

  const [formData, setFormData] = useState({
    url: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    if (socialLink) {
      setFormData({
        url: socialLink.url || '',
        isActive: socialLink.isActive ?? true,
        order: socialLink.order || 0,
      });
    }
  }, [socialLink]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await updateSocialLink({ id, data: formData }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Social link updated successfully!' }));
      router.push('/admin/social-links');
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update social link';
      dispatch(addToast({ type: 'error', message: errorMessage }));
    }
  };

  if (!socialLink) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="text-center">Loading or Social link not found...</div>
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
            <Link href="/admin/social-links">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                Edit {socialLink.platform.charAt(0).toUpperCase() + socialLink.platform.slice(1)} Link
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Update social media link
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
                {/* Platform (Read-only) */}
                <div>
                  <label className="mb-2 block font-medium">
                    Platform
                  </label>
                  <Input
                    value={socialLink.platform.charAt(0).toUpperCase() + socialLink.platform.slice(1)}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800"
                  />
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
                    {isLoading ? 'Saving...' : 'Save Changes'}
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

