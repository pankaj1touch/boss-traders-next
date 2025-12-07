'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminGetAllDemoClassesQuery, useAdminDeleteDemoClassMutation } from '@/store/api/adminApi';
import { useGetCoursesQuery } from '@/store/api/courseApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Edit2, Plus, Search, Trash2, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDemoClassesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useAdminGetAllDemoClassesQuery({
    page,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const [deleteDemoClass] = useAdminDeleteDemoClassMutation();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDemoClass(id).unwrap();
        alert('Demo class deleted successfully');
      } catch (error) {
        alert('Failed to delete demo class');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Demo Classes</h1>
          <p className="text-muted-foreground mt-1">Manage all demo classes</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/demo-classes/registrations">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Pending Registrations
            </Button>
          </Link>
          <Link href="/admin/demo-classes/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Demo Class
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search demo classes..."
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
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading demo classes...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
          <p className="text-red-800 dark:text-red-200">Failed to load demo classes</p>
        </div>
      )}

      {/* Demo Classes Table */}
      {!isLoading && !error && data && (
        <>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Demo Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Scheduled At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.demoClasses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No demo classes found
                      </td>
                    </tr>
                  ) : (
                    data.demoClasses.map((demoClass: any) => (
                      <tr key={demoClass._id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{demoClass.title}</div>
                          {demoClass.description && (
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {demoClass.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {demoClass.courseId ? (
                            <div className="text-sm">
                              <div className="font-medium text-foreground">
                                {typeof demoClass.courseId === 'object' ? demoClass.courseId.title : 'N/A'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No course</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">
                            {format(new Date(demoClass.scheduledAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(demoClass.scheduledAt), 'hh:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">
                            {demoClass.registeredCount} / {demoClass.maxAttendees}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusColor(demoClass.status)}>
                            {demoClass.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/demo-classes/${demoClass._id}/edit`}>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleDelete(demoClass._id, demoClass.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

