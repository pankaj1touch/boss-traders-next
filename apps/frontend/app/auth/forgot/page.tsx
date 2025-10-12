'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ToastContainer } from '@/components/ui/Toast';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store/hooks';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      
      // Call forgot password API
      const response = await fetch('http://localhost:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        dispatch(addToast({ type: 'success', message: result.message }));
      } else {
        dispatch(addToast({ type: 'error', message: result.message || 'Failed to send reset email' }));
      }
    } catch (error: any) {
      dispatch(addToast({ type: 'error', message: 'Network error. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4 dark:from-gray-900 dark:to-gray-800">
        <ToastContainer />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <BookOpen className="h-10 w-10 text-primary-600" />
              <span className="text-2xl font-bold">Boss Traders investor class</span>
            </Link>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lg dark:bg-gray-900">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-bold">Check Your Email</h1>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                We've sent a password reset link to <strong>{getValues('email')}</strong>
              </p>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Email
                </Button>
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4 dark:from-gray-900 dark:to-gray-800">
      <ToastContainer />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <BookOpen className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold">Boss Traders investor class</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Forgot Password</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a reset link
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg dark:bg-gray-900">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="inline-flex items-center text-sm text-primary-600 hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
