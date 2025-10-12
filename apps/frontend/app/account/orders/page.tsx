'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetUserOrdersQuery } from '@/store/api/orderApi';
import { formatPrice } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetUserOrdersQuery();

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/account')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Account
              </Button>
              <h1 className="text-4xl font-bold">Order History</h1>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : data?.orders.length === 0 ? (
            <Card className="py-20 text-center">
              <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">No orders yet</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Start shopping to see your orders here
              </p>
              <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {data?.orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="text-lg font-bold">Order #{order.orderNumber}</h3>
                            <Badge variant={getStatusVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(order.createdAt), 'PPP')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-600">
                            {formatPrice(order.total)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-800">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.title}
                            </span>
                            <span className="font-medium">{formatPrice(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

