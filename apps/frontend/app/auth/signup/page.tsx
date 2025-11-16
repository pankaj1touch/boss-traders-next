'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ToastContainer } from '@/components/ui/Toast';
import { useSignupMutation } from '@/store/api/authApi';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store/hooks';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    const redirectParam = searchParams.get('redirect');
    const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : null;

    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Account created successfully! You can now login.' }));
      if (safeRedirect) {
        router.push(`/auth/login?redirect=${encodeURIComponent(safeRedirect)}`);
      } else {
        router.push('/auth/login');
      }
    } catch (error: any) {
      dispatch(addToast({ type: 'error', message: error.data?.message || 'Signup failed' }));
    }
  };

  const loginRedirectSuffix = (() => {
    const redirectParam = searchParams.get('redirect');
    return redirectParam && redirectParam.startsWith('/') ? `?redirect=${encodeURIComponent(redirectParam)}` : '';
  })();

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
            <Image
              src="/logo.jpeg"
              alt="Boss Traders Investor Class"
              width={40}
              height={40}
              className="rounded-lg"
              priority
            />
            <span className="text-2xl font-bold">Boss Traders investor class</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Start your learning journey today</p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg dark:bg-gray-900">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Create a password"
              error={errors.password?.message}
              {...register('password')}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href={`/auth/login${loginRedirectSuffix}`} className="font-medium text-primary-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

