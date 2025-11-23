'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  useAdminGetAllBannersQuery,
  useAdminDeleteBannerMutation,
  useAdminUpdateBannerMutation,
} from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit2, Plus, Search, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

export default function AdminBannersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const dispatch = useAppDispatch();

  const { data, isLoading, error, refetch } = useAdminGetAllBannersQuery({
    isActive: statusFilter || undefined,
    sort: 'order',
  });

  const [deleteBanner] = useAdminDeleteBannerMutation();
  const [updateBanner] = useAdminUpdateBannerMutation();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteBanner(id).unwrap();
        dispatch(addToast({ type: 'success', message: 'Banner deleted successfully' }));
        refetch();
      } catch (error) {
        dispatch(addToast({ type: 'error', message: 'Failed to delete banner' }));
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateBanner({ id, data: { isActive: !currentStatus } }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `Banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        })
      );
      refetch();
    } catch (error) {
      dispatch(addToast({ type: 'error', message: 'Failed to update banner' }));
    }
  };

  const filteredBanners = data?.banners?.filter((banner) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        banner.title.toLowerCase().includes(searchLower) ||
        banner.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Banners</h1>
          <p className="text-muted-foreground mt-1">Manage homepage banners</p>
        </div>
        <Link href="/admin/banners/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Banner
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search banners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading banners...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
          <p className="text-red-800 dark:text-red-200">Failed to load banners</p>
        </div>
      )}

      {/* Banners Grid */}
      {!isLoading && !error && filteredBanners && (
        <>
          {filteredBanners.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border bg-card">
              <p className="text-muted-foreground mb-4">No banners found</p>
              <Link href="/admin/banners/create">
                <Button>Create your first banner</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBanners.map((banner) => (
                <div
                  key={banner._id}
                  className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Banner Image */}
                  <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
                    {banner.imageUrl ? (
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No image</p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          banner.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Banner Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-foreground line-clamp-1">{banner.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{banner.description}</p>
                    <p className="text-xs text-muted-foreground">Order: {banner.order}</p>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner._id, banner.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        banner.isActive
                          ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950'
                          : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                      }`}
                      title={banner.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {banner.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <Link href={`/admin/banners/${banner._id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(banner._id, banner.title)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

