'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useGetOrderByIdQuery } from '@/store/api/orderApi';
import { formatPrice } from '@/lib/utils';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data, isLoading } = useGetOrderByIdQuery(orderId || '', {
    skip: !orderId,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container-custom py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-2xl text-center"
        >
          <Card>
            <CardContent className="py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CheckCircle className="mx-auto mb-6 h-24 w-24 text-green-600" />
              </motion.div>

              <h1 className="mb-4 text-4xl font-bold">Payment Successful!</h1>
              <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
                Thank you for your purchase. Your order has been confirmed.
              </p>

              {isLoading && (
                <div className="mb-8 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
                </div>
              )}

              {data?.order && (
                <div className="mb-8 space-y-4">
                  {/* Order Details */}
                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:from-green-950 dark:to-emerald-950">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Number</p>
                      </div>
                      <Badge variant={data.order.status === 'completed' ? 'success' : 'default'}>
                        {data.order.status}
                      </Badge>
                    </div>
                    <p className="font-mono text-lg font-semibold text-green-700 dark:text-green-400">
                      {data.order.orderNumber}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="rounded-xl border-2 border-gray-200 p-4 dark:border-gray-800">
                    <div className="space-y-3">
                      {data.order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.title}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t-2 border-gray-200 pt-3 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(data.order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  {data.order.paymentId && (
                    <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Transaction ID
                        </p>
                      </div>
                      <p className="font-mono text-sm text-blue-700 dark:text-blue-300">
                        {data.order.paymentId}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-xl bg-amber-50 p-4 mb-6 dark:bg-amber-950">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ✨ <strong>Course Activated!</strong> You can now start learning. Check your email for course access details.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" onClick={() => router.push('/account/orders')}>
                  View My Orders
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/courses')}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

