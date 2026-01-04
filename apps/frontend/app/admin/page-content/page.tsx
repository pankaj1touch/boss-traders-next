'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { ToastContainer } from '@/components/ui/Toast';
import { useAdminGetAllPageContentsQuery } from '@/store/api/pageContentApi';

const pageTypeLabels: Record<string, string> = {
  about: 'About Us',
  contact: 'Contact',
  careers: 'Careers',
};

export default function AdminPageContentPage() {
  const { data, isLoading } = useAdminGetAllPageContentsQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const pageContents = data?.pageContents || [];

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />

      {/* Header */}
      <div className="border-b bg-white py-6 dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Page Content Management</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage About Us, Contact, and Careers pages
              </p>
            </div>
            {pageContents.length < 3 && (
              <Link href="/admin/page-content/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Page Content
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <div className="container-custom">
          {pageContents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  No page content found. Create your first page content.
                </p>
                <Link href="/admin/page-content/create">
                  <Button>Create Page Content</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pageContents.map((pageContent) => (
                <motion.div
                  key={pageContent._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">
                          {pageTypeLabels[pageContent.pageType] || pageContent.pageType}
                        </h3>
                        {pageContent.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>

                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        {pageContent.title}
                      </p>

                      <div className="mb-4 text-xs text-gray-500">
                        Updated: {new Date(pageContent.updatedAt).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/admin/page-content/${pageContent._id}/edit`} className="flex-1">
                          <Button variant="outline" className="w-full gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/${pageContent.pageType}`} target="_blank">
                          <Button variant="outline" className="gap-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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

