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
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store/hooks';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const redirectParam = searchParams.get('redirect');
    const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : null;

    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials(result));
      dispatch(addToast({ type: 'success', message: 'Login successful!' }));

      if (safeRedirect) {
        router.push(safeRedirect);
        return;
      }

      // Role-based redirect
      const userRoles = result.user?.roles || [];
      if (userRoles.includes('admin')) {
        router.push('/admin');
      } else if (userRoles.includes('student')) {
        router.push('/student');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      dispatch(addToast({ type: 'error', message: error.data?.message || 'Login failed' }));
    }
  };

  const redirectSuffix = (() => {
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
              src="/logo.png"
              alt="Boss Traders Investor Class"
              width={150}
              height={150}
              className="rounded-lg"
              priority
            />
            <span className="text-2xl font-bold">Boss Traders investor class</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Login to continue your learning journey</p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg dark:bg-gray-900">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Remember me</span>
              </label>
              <Link href="/auth/forgot" className="text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href={`/auth/signup${redirectSuffix}`} className="font-medium text-primary-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

