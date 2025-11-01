'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, Phone, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetOrderByIdQuery, useProcessPaymentMutation, useVerifyPaymentMutation } from '@/store/api/orderApi';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const orderId = params.orderId as string;

  const { data, isLoading } = useGetOrderByIdQuery(orderId);
  const [processPayment, { isLoading: isProcessing }] = useProcessPaymentMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

  const [paymentMethod, setPaymentMethod] = useState('call');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePayment = async () => {
    try {
      await processPayment({ orderId, paymentMethod }).unwrap();
      dispatch(clearCart());
      dispatch(addToast({ type: 'success', message: 'Payment successful!' }));
      router.push(`/success?orderId=${orderId}`);
    } catch (error: any) {
      dispatch(addToast({ type: 'error', message: error.data?.message || 'Payment failed' }));
      router.push(`/fail?orderId=${orderId}`);
    }
  };

  const handleCallPayment = async () => {
    if (!transactionId.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter transaction ID' }));
      return;
    }

    try {
      await verifyPayment({ 
        orderId, 
        transactionId: transactionId.trim() 
      }).unwrap();
      dispatch(clearCart());
      dispatch(addToast({ 
        type: 'success', 
        message: '🎉 Payment successful! Your course is now active. Start learning!' 
      }));
      router.push(`/success?orderId=${orderId}`);
    } catch (error: any) {
      dispatch(addToast({ 
        type: 'error', 
        message: error.data?.message || 'Payment submission failed' 
      }));
    }
  };

  const handleCopyPhone = () => {
    const phoneNumber = '+91 1234567890'; // Replace with actual phone number from config/order
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    dispatch(addToast({ type: 'success', message: 'Phone number copied!' }));
    setTimeout(() => setCopied(false), 2000);
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
          <h1 className="mb-8 text-4xl font-bold">Checkout</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Call Payment Option */}
                    <label className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'call' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 hover:border-primary-500'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="call"
                        checked={paymentMethod === 'call'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-primary-500"
                      />
                      <Phone className="h-6 w-6 text-primary-600" />
                      <div>
                        <span className="font-medium">Call to Pay</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Call us to complete your payment</p>
                      </div>
                    </label>

                    {/* Card Payment Option */}
                    <label className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'card' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 hover:border-primary-500'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-primary-500"
                      />
                      <CreditCard className="h-6 w-6 text-primary-600" />
                      <span className="font-medium">Credit / Debit Card</span>
                    </label>
                  </div>

                  {/* Call Payment Display */}
                  {paymentMethod === 'call' && (
                    <div className="space-y-4 rounded-xl bg-gradient-to-br from-primary-50 to-blue-50 p-6 dark:from-primary-950 dark:to-blue-950">
                      <div className="text-center">
                        <h3 className="mb-2 text-xl font-semibold text-primary-900 dark:text-primary-100">
                          Call Us to Complete Payment
                        </h3>
                        <p className="mb-4 text-2xl font-bold text-primary-600 dark:text-primary-400">
                          ₹{order.total.toFixed(2)}
                        </p>
                        
                        {/* Phone Number Display */}
                        <div className="mx-auto mb-4 w-fit rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
                          <div className="flex flex-col items-center gap-4">
                            <Phone className="h-12 w-12 text-primary-600" />
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Call us at</p>
                              <div className="flex items-center gap-2">
                                <a
                                  href="tel:+911234567890"
                                  className="text-2xl font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                  aria-label="Call phone number"
                                >
                                  +91 1234567890
                                </a>
                                <button
                                  onClick={handleCopyPhone}
                                  className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                                  aria-label="Copy phone number"
                                >
                                  {copied ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <a
                              href="tel:+911234567890"
                              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                              aria-label="Call now"
                            >
                              <Phone className="h-5 w-5" />
                              Call Now
                            </a>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          📞 Our team will assist you with payment and course activation
                        </p>
                      </div>

                      {/* Payment Confirmation Form */}
                      <div className="mt-6 space-y-4 rounded-xl border-t-2 border-primary-200 bg-white pt-4 dark:border-primary-800 dark:bg-gray-900">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          ✅ After payment via call, submit details:
                        </p>
                        
                        <Input
                          label="Transaction ID / Reference Number"
                          placeholder="Enter transaction ID provided by our team"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                        />

                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                          <p className="font-medium">📌 Important:</p>
                          <p className="text-xs">After completing payment over the call, enter the transaction ID provided by our team. We will verify and activate your course within 24 hours.</p>
                        </div>

                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleCallPayment}
                          disabled={!transactionId.trim()}
                          isLoading={isVerifying}
                        >
                          Submit Payment Details
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Card Payment Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Expiry Date" placeholder="MM/YY" />
                        <Input label="CVV" placeholder="123" />
                      </div>
                      <Input label="Cardholder Name" placeholder="John Doe" />

                      <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                        <p className="font-medium">Demo Mode:</p>
                        <p>This is a mock payment. Your actual payment method will not be charged.</p>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handlePayment}
                        isLoading={isProcessing}
                      >
                        Complete Payment
                      </Button>
                    </div>
                  )}
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
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPrice(order.tax)}</span>
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-800" />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(order.total)}</span>
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

