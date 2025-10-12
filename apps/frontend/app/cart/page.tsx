'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeFromCart, clearCart } from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';
import { formatPrice } from '@/lib/utils';
import { useCreateOrderMutation } from '@/store/api/orderApi';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
    dispatch(addToast({ type: 'success', message: 'Item removed from cart' }));
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
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
              <div className="lg:col-span-2 space-y-4">
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
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%)</span>
                      <span>{formatPrice(total * 0.1)}</span>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-800" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">{formatPrice(total * 1.1)}</span>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                      isLoading={isLoading}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/courses')}
                    >
                      Continue Shopping
                    </Button>
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

