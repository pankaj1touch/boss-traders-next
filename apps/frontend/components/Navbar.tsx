'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  BookOpen,
  Video,
  FileText,
  Bell,
  LogOut,
  Settings,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation({}).unwrap();
    } catch (error) {
      // Ignore error
    } finally {
      dispatch(logout());
    }
  };

  const navLinks = [
    { href: '/blog', label: 'Blog', icon: FileText },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/live', label: 'Live Classes', icon: Video },
    { href: '/ebooks', label: 'eBooks', icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 md:gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              transition={{ duration: 0.2 }}
              className="relative h-10 w-10 shrink-0 md:h-12 md:w-12"
            >
              <Image
                src="/logo.png"
                alt="Boss Traders Investor Class"
                fill
                className="rounded-lg object-contain"
                priority
                sizes="(max-width: 768px) 40px, 48px"
              />
            </motion.div>
            <span className="hidden text-sm font-bold text-gray-900 dark:text-white sm:block md:text-base lg:text-xl">
              <span className="block leading-tight">BOSS TRADERS</span>
              <span className="text-xs font-normal text-gray-600 dark:text-gray-400 md:text-sm">INVESTOR CLASS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                {hydrated && cartItems.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-medium md:block">{user.name}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                    >
                      {/* Student Portal - Show for students only */}
                      {user?.roles?.includes('student') && !user?.roles?.includes('admin') && (
                        <>
                          <Link
                            href="/student"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-gray-100 dark:text-primary-400 dark:hover:bg-gray-800"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Student Portal
                          </Link>
                          <hr className="my-2 border-gray-200 dark:border-gray-800" />
                        </>
                      )}
                      
                      {/* Admin Panel - Show for admins only */}
                      {user?.roles?.includes('admin') && (
                        <>
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-gray-100 dark:text-primary-400 dark:hover:bg-gray-800"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Admin Panel
                          </Link>
                          <hr className="my-2 border-gray-200 dark:border-gray-800" />
                        </>
                      )}
                      
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Orders
                      </Link>
                      <Link
                        href="/account/notifications"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Link>
                      <hr className="my-2 border-gray-200 dark:border-gray-800" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden"
          >
            <div className="container-custom py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 py-3 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="mt-4 flex gap-2">
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

