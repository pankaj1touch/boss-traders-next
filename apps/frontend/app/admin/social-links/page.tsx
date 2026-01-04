'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { ToastContainer } from '@/components/ui/Toast';
import { 
  useAdminGetAllSocialLinksQuery, 
  useDeleteSocialLinkMutation 
} from '@/store/api/socialLinkApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { platformIcons } from '@/store/api/socialLinkApi';

export default function AdminSocialLinksPage() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAdminGetAllSocialLinksQuery();
  const [deleteSocialLink] = useDeleteSocialLinkMutation();

  const handleDelete = async (id: string, platform: string) => {
    if (window.confirm(`Are you sure you want to delete ${platform} link?`)) {
      try {
        await deleteSocialLink(id).unwrap();
        dispatch(addToast({ type: 'success', message: 'Social link deleted successfully' }));
      } catch (error: any) {
        const errorMessage = error?.data?.message || error?.message || 'Failed to delete social link';
        dispatch(addToast({ type: 'error', message: errorMessage }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const socialLinks = data?.socialLinks || [];

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      
      <div className="border-b bg-white py-6 dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Social Media Links</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage social media links displayed in footer
              </p>
            </div>
            <Link href="/admin/social-links/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Social Link
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="container-custom">
          {socialLinks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  No social links found. Add your first social media link.
                </p>
                <Link href="/admin/social-links/create">
                  <Button>Add Social Link</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {socialLinks.map((link) => {
                const Icon = platformIcons[link.platform];
                return (
                  <motion.div
                    key={link._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {Icon && <Icon className="h-6 w-6" />}
                            <h3 className="text-lg font-semibold capitalize">
                              {link.platform}
                            </h3>
                          </div>
                          {link.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 break-all">
                          {link.url}
                        </p>

                        <div className="flex gap-2">
                          <Link href={`/admin/social-links/${link._id}/edit`} className="flex-1">
                            <Button variant="outline" className="w-full gap-2">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="gap-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(link._id, link.platform)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

