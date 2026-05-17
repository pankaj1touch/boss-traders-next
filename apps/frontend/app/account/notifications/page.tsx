'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppSelector } from '@/store/hooks';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/account')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Button>
            <h1 className="text-4xl font-bold">Notifications</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your notification preferences
            </p>
          </div>

          <Card className="py-16 text-center">
            <Bell className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
            <h2 className="mb-2 text-xl font-bold">Coming soon</h2>
            <p className="mb-6 max-w-md mx-auto text-gray-600 dark:text-gray-400">
              Notification preferences and history will be available here. You’ll be able to choose what updates you receive by email or in-app.
            </p>
            <Button variant="outline" onClick={() => router.push('/account')}>
              Back to Account
            </Button>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
