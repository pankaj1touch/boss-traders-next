'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { useAdminConfirmPaymentMutation, useAdminGetOrdersQuery, useAdminGetPendingRegistrationsQuery, type AdminOrder } from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { formatPrice } from '@/lib/utils';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
};

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const { data, isLoading, isFetching } = useAdminGetOrdersQuery({
    page,
    search: search || undefined,
    status: statusFilter || undefined,
  });
  const [confirmPayment, { isLoading: isConfirming }] = useAdminConfirmPaymentMutation();
  
  // Get pending demo class registrations count
  const { data: registrationsData } = useAdminGetPendingRegistrationsQuery({
    approvalStatus: 'pending',
  });
  const pendingDemoRegistrationsCount = registrationsData?.registrations?.length || 0;

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'pending').length,
    [orders]
  );

  const handleConfirm = async () => {
    if (!selectedOrder) return;
    try {
      await confirmPayment({ orderId: selectedOrder._id }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Payment confirmed and enrollment activated.' }));
      setSelectedOrder(null);
    } catch (error: any) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to confirm payment.' }));
    }
  };

  const renderStatusBadge = (status: string, verified?: boolean) => {
    const variant = statusVariant[status] || 'secondary';
    return (
      <div className="flex flex-col gap-1">
        <Badge variant={variant}>
          {status === 'completed' ? 'Completed' : status === 'pending' ? 'Pending' : 'Failed'}
        </Badge>
        {verified && <span className="text-xs text-green-600 dark:text-green-300">Verified</span>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ToastContainer />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Review student purchases and activate enrollments manually.</p>
      </div>

      {/* Pending Demo Class Registrations Alert */}
      {pendingDemoRegistrationsCount > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  {pendingDemoRegistrationsCount} Pending Demo Class Registration{pendingDemoRegistrationsCount > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Review and approve demo class registrations
                </p>
              </div>
              <Link href="/admin/demo-classes/registrations">
                <Button variant="outline" size="sm" className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900">
                  View Registrations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Orders on this page</p>
            <p className="text-3xl font-semibold text-foreground">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending confirmation</p>
            <p className="text-3xl font-semibold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total revenue (page)</p>
            <p className="text-3xl font-semibold text-foreground">
              {formatPrice(orders.reduce((sum, order) => sum + (order.total || 0), 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by order number or transaction ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/40 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
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
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Loading orders...
                  </td>
                </tr>
              )}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-foreground">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.paymentId ? `Txn: ${order.paymentId}` : 'No transaction ID yet'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{order.userId?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.userId?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span>{order.items[0]?.title}</span>
                          {order.items[0]?.demoClassId && (
                            <Link
                              href="/admin/demo-classes/registrations"
                              className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              (Demo Class)
                            </Link>
                          )}
                        </div>
                        {order.items.length > 1 && (
                          <span className="text-xs text-muted-foreground">+{order.items.length - 1} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-foreground">{formatPrice(order.total)}</p>
                      <p className="text-xs text-muted-foreground">Subtotal {formatPrice(order.subtotal)}</p>
                    </td>
                    <td className="px-6 py-4">{renderStatusBadge(order.status, order.paymentVerified)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {isFetching && !isLoading && (
          <p className="px-6 py-3 text-xs text-muted-foreground">Refreshing data...</p>
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={page === pagination.pages}
            onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
          >
            Next
          </Button>
        </div>
      )}

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : 'Order details'}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6 p-6 bg-white dark:bg-gray-900">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="space-y-2 p-5">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedOrder.userId?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.userId?.email}</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="space-y-2 p-5">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payment</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatPrice(selectedOrder.total)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tax {formatPrice(selectedOrder.tax)} • Method {selectedOrder.paymentMethod || 'Call'}
                  </p>
                  {selectedOrder.paymentId && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID: {selectedOrder.paymentId}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {selectedOrder.items.map((item: any) => (
                  <div
                    key={`${item.title}-${item.courseId || item.ebookId || item.demoClassId}`}
                    className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.courseId ? 'Course' : item.ebookId ? 'eBook' : item.demoClassId ? 'Demo Class' : 'Item'}
                        </p>
                        {item.demoClassId && (
                          <Link
                            href="/admin/demo-classes/registrations"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                          >
                            View Registration
                          </Link>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>{renderStatusBadge(selectedOrder.status, selectedOrder.paymentVerified)}</div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={selectedOrder.status === 'completed'}
                  isLoading={isConfirming}
                >
                  Mark as paid & enroll
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

