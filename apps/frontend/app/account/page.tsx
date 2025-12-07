'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Bell, Settings, BookOpen, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppSelector } from '@/store/hooks';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const menuItems = [
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your account details',
      href: '/account/profile',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: BookOpen,
      title: 'My Courses',
      description: 'View your enrolled courses',
      href: '/account/courses',
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      icon: ShoppingBag,
      title: 'Orders',
      description: 'View your order history',
      href: '/account/orders',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      icon: Video,
      title: 'Demo Classes',
      description: 'View your demo class registrations',
      href: '/account/demo-classes',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your notifications',
      href: '/account/notifications',
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold">My Account</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name}!
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  hover
                  className="h-full cursor-pointer"
                  onClick={() => router.push(item.href)}
                >
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

