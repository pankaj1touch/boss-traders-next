'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  useAdminGetAllCouponsQuery,
  useAdminDeleteCouponMutation,
  useAdminUpdateCouponMutation,
} from '@/store/api/adminApi';
import { Coupon } from '@/store/api/couponApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Edit2, Plus, Search, Trash2, Eye, EyeOff, Percent, DollarSign, Copy, CheckCircle } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

const typeIcons = {
  percentage: Percent,
  fixed: DollarSign,
};

const typeColors = {
  percentage: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  fixed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const applicableToColors = {
  all: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  courses: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ebooks: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'demo-classes': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  specific: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

export default function AdminCouponsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [applicableToFilter, setApplicableToFilter] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const { data, isLoading, error, refetch } = useAdminGetAllCouponsQuery({
    isActive: statusFilter || undefined,
    type: typeFilter || undefined,
    applicableTo: applicableToFilter || undefined,
    sort: 'newest',
  });

  const [deleteCoupon] = useAdminDeleteCouponMutation();
  const [updateCoupon] = useAdminUpdateCouponMutation();

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      try {
        await deleteCoupon(id).unwrap();
        dispatch(addToast({ type: 'success', message: 'Coupon deleted successfully' }));
        refetch();
      } catch (error) {
        dispatch(addToast({ type: 'error', message: 'Failed to delete coupon' }));
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateCoupon({ id, data: { isActive: !currentStatus } }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        })
      );
      refetch();
    } catch (error) {
      dispatch(addToast({ type: 'error', message: 'Failed to update coupon' }));
    }
  };

  const handleCopyCode = (code: string) => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      dispatch(addToast({ type: 'success', message: 'Coupon code copied!' }));
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const filteredCoupons = useMemo(() => {
    if (!data?.coupons) return [];
    
    return data.coupons.filter((coupon: Coupon) => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          coupon.code.toLowerCase().includes(searchLower) ||
          coupon.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [data?.coupons, search]);

  const stats = useMemo(() => {
    if (!data?.coupons) return { total: 0, active: 0, expired: 0, totalUsage: 0 };
    
    const now = new Date();
    return {
      total: data.coupons.length,
      active: data.coupons.filter((c: Coupon) => c.isActive && (!c.endDate || new Date(c.endDate) > now)).length,
      expired: data.coupons.filter((c: Coupon) => c.endDate && new Date(c.endDate) <= now).length,
      totalUsage: data.coupons.reduce((sum: number, c: Coupon) => sum + c.usageCount, 0),
    };
  }, [data?.coupons]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground mt-1">Manage discount coupons and promotional codes</p>
        </div>
        <Link href="/admin/coupons/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Coupons</p>
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
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Usage</p>
            <p className="text-3xl font-semibold text-blue-600">{stats.totalUsage}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search coupons..."
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
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
        <select
          value={applicableToFilter}
          onChange={(e) => setApplicableToFilter(e.target.value)}
          className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Applicable To</option>
          <option value="all">All</option>
          <option value="courses">Courses</option>
          <option value="ebooks">eBooks</option>
          <option value="demo-classes">Demo Classes</option>
          <option value="specific">Specific Items</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading coupons...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
          <p className="text-red-800 dark:text-red-200">Failed to load coupons</p>
        </div>
      )}

      {/* Coupons Table */}
      {!isLoading && !error && filteredCoupons && (
        <>
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border bg-card">
              <p className="text-muted-foreground mb-4">No coupons found</p>
              <Link href="/admin/coupons/create">
                <Button>Create your first coupon</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent/40 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Applicable To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Expiry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCoupons.map((coupon: Coupon) => {
                      const TypeIcon = typeIcons[coupon.type];
                      const isExpired = coupon.endDate && new Date(coupon.endDate) <= new Date();
                      const usagePercentage = coupon.usageLimit
                        ? (coupon.usageCount / coupon.usageLimit) * 100
                        : 0;

                      return (
                        <tr key={coupon._id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-foreground font-mono">
                                    {coupon.code}
                                  </p>
                                  <button
                                    onClick={() => handleCopyCode(coupon.code)}
                                    className="p-1 rounded hover:bg-accent transition-colors"
                                    title="Copy code"
                                  >
                                    {copiedCode === coupon.code ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                                {coupon.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {coupon.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={typeColors[coupon.type]}>
                              {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-foreground">
                              {coupon.type === 'percentage' ? (
                                <>{coupon.value}%</>
                              ) : (
                                <>₹{coupon.value}</>
                              )}
                            </p>
                            {coupon.maxDiscountAmount && (
                              <p className="text-xs text-muted-foreground">
                                Max: ₹{coupon.maxDiscountAmount}
                              </p>
                            )}
                            {coupon.minPurchaseAmount > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Min: ₹{coupon.minPurchaseAmount}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={applicableToColors[coupon.applicableTo]}>
                              {coupon.applicableTo === 'all'
                                ? 'All'
                                : coupon.applicableTo === 'demo-classes'
                                ? 'Demo Classes'
                                : coupon.applicableTo.charAt(0).toUpperCase() + coupon.applicableTo.slice(1)}
                            </Badge>
                            {coupon.applicableTo === 'specific' && coupon.specificItems && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {coupon.specificItems.length} item(s)
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-foreground">
                                {coupon.usageCount}
                                {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                              </span>
                              {coupon.usageLimit && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      usagePercentage >= 100
                                        ? 'bg-red-600'
                                        : usagePercentage >= 80
                                        ? 'bg-yellow-600'
                                        : 'bg-green-600'
                                    }`}
                                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {coupon.endDate ? (
                              <div>
                                <p>{format(new Date(coupon.endDate), 'dd MMM yyyy')}</p>
                                {isExpired && (
                                  <p className="text-xs text-red-600">Expired</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs">No expiry</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={
                                  isExpired
                                    ? 'danger'
                                    : coupon.isActive
                                    ? 'success'
                                    : 'secondary'
                                }
                              >
                                {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                                className={`p-2 rounded-lg transition-colors ${
                                  coupon.isActive
                                    ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950'
                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                                }`}
                                title={coupon.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {coupon.isActive ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                              <Link href={`/admin/coupons/${coupon._id}/edit`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Edit2 className="h-4 w-4" />
                                  Edit
                                </Button>
                              </Link>
                              <button
                                onClick={() => handleDelete(coupon._id, coupon.code)}
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

