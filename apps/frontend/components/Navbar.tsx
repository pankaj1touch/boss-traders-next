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
  Phone,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
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
    { href: '/demo-classes', label: 'Demo Classes', icon: Video },
    { href: '/live', label: 'Live Classes', icon: Video },
    { href: '/ebooks', label: 'eBooks', icon: FileText },
  ];

  // Contact links
  const whatsappNumber = '919229255662'; // spaces removed
  const phoneNumber = '+919229255662';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const phoneUrl = `tel:${phoneNumber}`;

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
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* WhatsApp Icon */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
              aria-label="Contact us on WhatsApp"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>

            {/* Phone Icon */}
            <a
              href={phoneUrl}
              className="flex items-center justify-center rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
              aria-label="Call us"
            >
              <Phone className="h-5 w-5" />
            </a>

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
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <ThemeToggle />
              </div>
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

              {/* Contact Icons in Mobile Menu */}
              <div className="mt-4 flex items-center gap-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-sm font-medium">WhatsApp</span>
                </a>
                <a
                  href={phoneUrl}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Phone className="h-5 w-5" />
                  <span className="text-sm font-medium">Call</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

