'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Trash2, ShoppingCart, Phone, Copy, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeFromCart } from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';
import { formatPrice } from '@/lib/utils';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { useValidateCouponMutation } from '@/store/api/couponApi';

// Dynamically import CouponSection with SSR disabled to prevent hydration errors
const CouponSection = dynamic(() => import('@/components/CouponSection').then(mod => ({ default: mod.CouponSection })), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter coupon code"
          className="flex-1 uppercase"
          disabled
        />
        <Button variant="outline" size="sm" disabled>
          Apply
        </Button>
      </div>
    </div>
  ),
});

const SUPPORT_NUMBER = '+91 92292 55662';
const SUPPORT_TEL = 'tel:+919229255662';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();
  const [mounted, setMounted] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    finalTotal: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const redirectQuery = encodeURIComponent('/cart');

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
    dispatch(addToast({ type: 'success', message: 'Item removed from cart' }));
  };

  const handleApplyCoupon = async (code?: string) => {
    const codeToUse = (code || couponCode || '').toString().trim();
    if (!codeToUse) {
      dispatch(addToast({ type: 'error', message: 'Please enter a coupon code' }));
      return;
    }

    if (items.length === 0) {
      dispatch(addToast({ type: 'error', message: 'Your cart is empty' }));
      return;
    }

    try {
      const orderItems = items.map((item) => ({
        [item.type === 'course' ? 'courseId' : 'ebookId']: item.id,
        price: item.price,
      }));

      const result = await validateCoupon({
        code: codeToUse.toUpperCase(),
        items: items.map((item) => ({
          ...(item.type === 'course' && { courseId: String(item.id) }),
          ...(item.type === 'ebook' && { ebookId: String(item.id) }),
        })),
        userId: user?.id,
      }).unwrap();

      if (result.success && (result.valid !== false) && result.discount !== undefined) {
        const appliedCode = result.coupon?.code || codeToUse.toUpperCase();
        setAppliedCoupon({
          code: appliedCode,
          discount: result.discount,
          finalTotal: result.finalTotal || total - result.discount,
        });
        setCouponCode(appliedCode);
        dispatch(addToast({ type: 'success', message: result.message || 'Coupon applied successfully!' }));
      } else {
        dispatch(addToast({ type: 'error', message: result.message || 'Invalid coupon code' }));
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to validate coupon';
      dispatch(addToast({ type: 'error', message: errorMessage }));
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    dispatch(addToast({ type: 'success', message: 'Coupon removed' }));
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

      const result = await createOrder({
        items: orderItems,
        couponCode: appliedCoupon?.code,
      }).unwrap();
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

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ToastContainer />
        <div className="container-custom py-12">
          <div>
            <h1 className="mb-8 text-4xl font-bold">Shopping Cart</h1>
            <div className="animate-pulse">
              <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-12">
        <div>
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
                  <div key={item.id}>
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
                  </div>
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
                    {/* Coupon Section */}
                    <CouponSection
                      couponCode={couponCode}
                      setCouponCode={setCouponCode}
                      onApplyCoupon={handleApplyCoupon}
                      isValidatingCoupon={isValidatingCoupon}
                      appliedCoupon={appliedCoupon}
                      onRemoveCoupon={handleRemoveCoupon}
                    />

                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Items</span>
                        <span>{items.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({appliedCoupon.code})</span>
                          <span>-{formatPrice(appliedCoupon.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Admin assistance</span>
                        <span>Included</span>
                      </div>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-800" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total due</span>
                      <span className="text-primary-600">
                        {formatPrice(appliedCoupon?.finalTotal || total)}
                      </span>
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
        </div>
      </div>

      <Footer />
    </div>
  );
}

