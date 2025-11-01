'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">View your order history</p>
      </div>

      {/* Empty State */}
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
    </div>
  );
}










