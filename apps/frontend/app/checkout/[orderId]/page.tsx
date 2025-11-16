'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Copy, CheckCircle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetOrderByIdQuery } from '@/store/api/orderApi';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

const SUPPORT_NUMBER = '+91 92292 55662';
const SUPPORT_TEL = 'tel:+919229255662';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const orderId = params.orderId as string;

  const { data, isLoading } = useGetOrderByIdQuery(orderId);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  const handleCopyPhone = () => {
    if (typeof window === 'undefined' || !navigator?.clipboard) return;
    navigator.clipboard.writeText(SUPPORT_NUMBER);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
    dispatch(addToast({ type: 'success', message: 'Support number copied!' }));
  };

  const handleCopyOrderId = (orderNumber: string) => {
    if (typeof window === 'undefined' || !navigator?.clipboard) return;
    navigator.clipboard.writeText(orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
    dispatch(addToast({ type: 'success', message: 'Order number copied!' }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <h1 className="text-4xl font-bold">Order not found</h1>
        </div>
      </div>
    );
  }

  const { order } = data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-8 text-4xl font-bold">Confirm Enrollment</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Call to activate your courses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Your order has been saved. Call our enrollment desk now and share the details below so our team can
                    manually add the courses to your student portal.
                  </p>

                  <div className="space-y-4 rounded-2xl border border-primary-200 p-4 dark:border-primary-800">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order number</p>
                        <p className="text-2xl font-semibold text-primary-600">{order.orderNumber}</p>
                      </div>
                      <button
                        onClick={() => handleCopyOrderId(order.orderNumber)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        aria-label="Copy order number"
                      >
                        {copiedOrder ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy ID
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Enrollment desk</p>
                        <p className="text-2xl font-semibold text-primary-600">{SUPPORT_NUMBER}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCopyPhone}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          aria-label="Copy phone number"
                        >
                          {copiedPhone ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy number
                            </>
                          )}
                        </button>
                        <a
                          href={SUPPORT_TEL}
                          className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-2 font-semibold text-white hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        >
                          <Phone className="h-4 w-4" />
                          Call now
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl bg-gray-50 p-6 dark:bg-gray-900/60">
                    <div className="flex items-start gap-3">
                      <ClipboardCheck className="h-6 w-6 text-primary-600" />
                      <div>
                        <p className="font-semibold">What to share on the call</p>
                        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-400">
                          <li>Registered student name & email</li>
                          <li>Your order number and the courses/eBooks selected</li>
                          <li>Preferred batch or live class (if applicable)</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-semibold">After the call</p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Our admin team will activate the enrollment from the dashboard within 1 working day. You will
                          receive an email once the courses are added to your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => router.back()}>
                      Go back
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/student')}>
                      Go to student portal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate">{item.title}</span>
                        <span>{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <hr className="border-gray-200 dark:border-gray-800" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatPrice(order.tax)}</span>
                      </div>
                    )}
                  </div>

                  <hr className="border-gray-200 dark:border-gray-800" />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(order.total)}</span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-primary-50 p-4 text-sm text-primary-900 dark:bg-primary-950 dark:text-primary-100">
                    Share this summary with the admin team when you call. They will verify the total and grant access
                    from the dashboard.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

