'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, ShoppingCart, Phone, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeFromCart } from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';
import { formatPrice } from '@/lib/utils';
import { useCreateOrderMutation } from '@/store/api/orderApi';

const SUPPORT_NUMBER = '+91 92292 55662';
const SUPPORT_TEL = 'tel:+919229255662';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [copiedNumber, setCopiedNumber] = useState(false);

  const redirectQuery = encodeURIComponent('/cart');

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
    dispatch(addToast({ type: 'success', message: 'Item removed from cart' }));
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/signup?redirect=${redirectQuery}`);
      return;
    }

    try {
      const orderItems = items.map((item) => ({
        [item.type === 'course' ? 'courseId' : 'ebookId']: item.id,
      }));

      const result = await createOrder({ items: orderItems }).unwrap();
      router.push(`/checkout/${result.order._id}`);
    } catch (error: any) {
      dispatch(addToast({ type: 'error', message: error.data?.message || 'Failed to create order' }));
    }
  };

  const handleCopyNumber = () => {
    if (typeof window === 'undefined' || !navigator?.clipboard) {
      return;
    }
    navigator.clipboard.writeText(SUPPORT_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
    dispatch(addToast({ type: 'success', message: 'Support number copied!' }));
  };

  const goToAuth = (type: 'login' | 'signup') => {
    router.push(`/auth/${type}?redirect=${redirectQuery}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-8 text-4xl font-bold">Shopping Cart</h1>

          {items.length === 0 ? (
            <Card className="py-20 text-center">
              <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Start adding courses to your cart!
              </p>
              <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card>
                      <CardContent className="flex gap-4 p-6">
                        {item.thumbnail && (
                          <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl">
                            <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.type === 'course' ? 'Course' : 'eBook'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-primary-600">
                              {formatPrice(item.price)}
                            </span>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="rounded-full p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div>
                {!isAuthenticated && (
                  <Card className="mb-6 border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950">
                    <CardHeader>
                      <CardTitle className="text-lg">Create your student account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-amber-900 dark:text-amber-100">
                      <p>
                        Login or sign up before confirming enrollment. Your cart items stay saved, so you can pick up
                        right after creating your account.
                      </p>
                      <div className="flex flex-col gap-3">
                        <Button variant="primary" onClick={() => goToAuth('login')}>
                          Login to continue
                        </Button>
                        <Button variant="outline" onClick={() => goToAuth('signup')}>
                          Sign up & enroll
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="sticky top-20 space-y-4">
                  <CardHeader>
                    <CardTitle>Enrollment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Items</span>
                        <span>{items.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Admin assistance</span>
                        <span>Included</span>
                      </div>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-800" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total due</span>
                      <span className="text-primary-600">{formatPrice(total)}</span>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                      isLoading={isLoading}
                      disabled={!isAuthenticated || items.length === 0}
                    >
                      Confirm & Get Call Instructions
                    </Button>
                    {!isAuthenticated && (
                      <p className="text-center text-xs text-gray-500">
                        Login or create an account to confirm your enrollment.
                      </p>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => router.push('/courses')}>
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Need help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      Call our enrollment desk as soon as you confirm your order. Share your registered email and order
                      number so we can activate the courses manually.
                    </p>
                    <div className="rounded-2xl border border-primary-200 p-4 dark:border-primary-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">Call / WhatsApp</p>
                          <p className="text-2xl font-semibold text-primary-600">{SUPPORT_NUMBER}</p>
                        </div>
                        <button
                          onClick={handleCopyNumber}
                          className="rounded-xl border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          aria-label="Copy support number"
                        >
                          {copiedNumber ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          )}
                        </button>
                      </div>
                      <a
                        href={SUPPORT_TEL}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 font-semibold text-white hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      >
                        <Phone className="h-5 w-5" />
                        Call now
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

