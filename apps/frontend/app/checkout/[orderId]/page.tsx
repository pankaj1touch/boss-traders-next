'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, QrCode, Upload, Copy, Check } from 'lucide-react';
import Image from 'next/image';
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

  const [paymentMethod, setPaymentMethod] = useState('qr');
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

  const handleQRPayment = async () => {
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

  const handleCopyUPI = () => {
    if (order?.upiId) {
      navigator.clipboard.writeText(order.upiId);
      setCopied(true);
      dispatch(addToast({ type: 'success', message: 'UPI ID copied!' }));
      setTimeout(() => setCopied(false), 2000);
    }
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
                    {/* QR Code Payment Option */}
                    <label className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'qr' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 hover:border-primary-500'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="qr"
                        checked={paymentMethod === 'qr'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-primary-500"
                      />
                      <QrCode className="h-6 w-6 text-primary-600" />
                      <div>
                        <span className="font-medium">UPI / QR Code Payment</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pay via PhonePe, Google Pay, Paytm</p>
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

                  {/* QR Code Display */}
                  {paymentMethod === 'qr' && order.qrCodeImageUrl && (
                    <div className="space-y-4 rounded-xl bg-gradient-to-br from-primary-50 to-blue-50 p-6 dark:from-primary-950 dark:to-blue-950">
                      <div className="text-center">
                        <h3 className="mb-2 text-xl font-semibold text-primary-900 dark:text-primary-100">
                          Scan QR Code to Pay
                        </h3>
                        <p className="mb-4 text-2xl font-bold text-primary-600 dark:text-primary-400">
                          ₹{order.total.toFixed(2)}
                        </p>
                        
                        {/* QR Code Image */}
                        <div className="mx-auto mb-4 w-fit rounded-2xl bg-white p-4 shadow-lg">
                          <Image
                            src={order.qrCodeImageUrl}
                            alt="Payment QR Code"
                            width={280}
                            height={280}
                            className="rounded-xl"
                            priority
                          />
                        </div>

                        {/* UPI ID Display */}
                        <div className="mb-2 flex items-center justify-center gap-2">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            UPI ID: <span className="font-mono font-semibold">{order.upiId}</span>
                          </p>
                          <button
                            onClick={handleCopyUPI}
                            className="rounded-lg p-1 hover:bg-white/50 dark:hover:bg-black/20"
                            aria-label="Copy UPI ID"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          📱 Scan with PhonePe, Google Pay, Paytm, or any UPI app
                        </p>
                      </div>

                      {/* Payment Confirmation Form */}
                      <div className="mt-6 space-y-4 rounded-xl border-t-2 border-primary-200 bg-white pt-4 dark:border-primary-800 dark:bg-gray-900">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          ✅ After payment, submit details:
                        </p>
                        
                        <Input
                          label="Transaction ID / UTR Number"
                          placeholder="Enter 12-digit transaction ID"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                        />

                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                          <p className="font-medium">📌 Important:</p>
                          <p className="text-xs">Enter the transaction ID from your payment app after completing the payment. We will verify and activate your course within 24 hours.</p>
                        </div>

                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleQRPayment}
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

