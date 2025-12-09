'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  useAdminGetAllAnnouncementsQuery,
  useAdminDeleteAnnouncementMutation,
  useAdminUpdateAnnouncementMutation,
} from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Edit2, Plus, Search, Trash2, Eye, EyeOff, AlertCircle, Info, DollarSign, BookOpen, GraduationCap, Settings } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

const typeIcons = {
  general: Info,
  course: BookOpen,
  payment: DollarSign,
  educational: GraduationCap,
  system: Settings,
  promotion: AlertCircle,
};

const typeColors = {
  general: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  course: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  educational: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  system: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  promotion: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export default function AdminAnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const dispatch = useAppDispatch();

  const { data, isLoading, error, refetch } = useAdminGetAllAnnouncementsQuery({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    priority: priorityFilter || undefined,
    sort: 'newest',
  });

  const [deleteAnnouncement] = useAdminDeleteAnnouncementMutation();
  const [updateAnnouncement] = useAdminUpdateAnnouncementMutation();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteAnnouncement(id).unwrap();
        dispatch(addToast({ type: 'success', message: 'Announcement deleted successfully' }));
        refetch();
      } catch (error) {
        dispatch(addToast({ type: 'error', message: 'Failed to delete announcement' }));
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateAnnouncement({ id, data: { isActive: !currentStatus } }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `Announcement ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        })
      );
      refetch();
    } catch (error) {
      dispatch(addToast({ type: 'error', message: 'Failed to update announcement' }));
    }
  };

  const filteredAnnouncements = useMemo(() => {
    if (!data?.announcements) return [];
    
    return data.announcements.filter((announcement) => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          announcement.title.toLowerCase().includes(searchLower) ||
          announcement.body.toLowerCase().includes(searchLower) ||
          announcement.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [data?.announcements, search]);

  const stats = useMemo(() => {
    if (!data?.announcements) return { total: 0, active: 0, expired: 0 };
    
    return {
      total: data.announcements.length,
      active: data.announcements.filter((a) => a.isActive && a.status === 'active').length,
      expired: data.announcements.filter((a) => a.status === 'expired').length,
    };
  }, [data?.announcements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">Manage platform announcements</p>
        </div>
        <Link href="/admin/announcements/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Announcement
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Announcements</p>
            <p className="text-3xl font-semibold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-3xl font-semibold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="text-3xl font-semibold text-red-600">{stats.expired}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Types</option>
          <option value="general">General</option>
          <option value="course">Course</option>
          <option value="payment">Payment</option>
          <option value="educational">Educational</option>
          <option value="system">System</option>
          <option value="promotion">Promotion</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading announcements...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
          <p className="text-red-800 dark:text-red-200">Failed to load announcements</p>
        </div>
      )}

      {/* Announcements Table */}
      {!isLoading && !error && filteredAnnouncements && (
        <>
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border bg-card">
              <p className="text-muted-foreground mb-4">No announcements found</p>
              <Link href="/admin/announcements/create">
                <Button>Create your first announcement</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent/40 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAnnouncements.map((announcement) => {
                      const TypeIcon = typeIcons[announcement.type] || Info;
                      return (
                        <tr key={announcement._id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
                                {announcement.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{announcement.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={typeColors[announcement.type]}>
                              {announcement.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={priorityColors[announcement.priority]}>
                              {announcement.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={
                                  announcement.status === 'active'
                                    ? 'success'
                                    : announcement.status === 'expired'
                                    ? 'danger'
                                    : 'secondary'
                                }
                              >
                                {announcement.status}
                              </Badge>
                              {announcement.isActive && (
                                <span className="text-xs text-green-600 dark:text-green-300">Active</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            <div className="flex flex-col">
                              <span>👁️ {announcement.views}</span>
                              <span>👆 {announcement.clicks}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {format(new Date(announcement.createdAt), 'dd MMM yyyy')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleActive(announcement._id, announcement.isActive)}
                                className={`p-2 rounded-lg transition-colors ${
                                  announcement.isActive
                                    ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950'
                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                                }`}
                                title={announcement.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {announcement.isActive ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                              <Link href={`/admin/announcements/${announcement._id}/edit`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Edit2 className="h-4 w-4" />
                                  Edit
                                </Button>
                              </Link>
                              <button
                                onClick={() => handleDelete(announcement._id, announcement.title)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

