'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ShoppingBag } from 'lucide-react';
import { useGetUserOrdersQuery } from '@/store/api/orderApi';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
};

export default function OrdersPage() {
  const { data, isLoading } = useGetUserOrdersQuery();
  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">View your order history</p>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          Loading your orders...
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link href="/courses">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium">
              Start Shopping
            </button>
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent/40 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Order
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      <div>{order.orderNumber}</div>
                      {order.paymentId && (
                        <p className="text-xs text-muted-foreground">Txn: {order.paymentId}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="flex flex-col gap-1">
                        <span>{order.items[0]?.title}</span>
                        {order.items.length > 1 && (
                          <span className="text-xs text-muted-foreground">+{order.items.length - 1} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[order.status] || 'secondary'}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}












