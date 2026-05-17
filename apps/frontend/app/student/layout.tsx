'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector } from '@/store/hooks';
import { BookOpen, FileText, Home, PlayCircle, ShoppingBag, Menu, X, User, Lock } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Redirect admin users to admin panel
    if (user?.roles?.includes('admin')) {
      router.push('/admin');
      return;
    }

    // Ensure user has student role
    if (!user?.roles?.includes('student')) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!isAuthenticated || !user?.roles?.includes('student')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/student', icon: Home, label: 'Dashboard' },
    { href: '/student/my-courses', icon: BookOpen, label: 'My Courses' },
    { href: '/student/my-ebooks', icon: FileText, label: 'My Ebooks' },
    { href: '/student/live-sessions', icon: PlayCircle, label: 'Live Sessions' },
    { href: '/student/orders', icon: ShoppingBag, label: 'My Orders' },
    { href: '/account/profile', icon: User, label: 'Profile' },
    { href: '/account/change-password', icon: Lock, label: 'Change password' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/student') {
      return pathname === '/student';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - visible below xl (1280px) */}
      <header className="xl:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-white dark:bg-zinc-900 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/logo.png"
              alt="Boss Traders"
              fill
              className="rounded-lg object-contain"
              sizes="32px"
            />
          </div>
          <span className="font-bold text-foreground">Student Portal</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="xl:hidden fixed inset-0 z-[60] bg-black/50 top-14"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop (xl+): full height fixed, Mobile/Tablet: slide-over */}
      <aside
        className={`
          fixed left-0 z-[70] w-64 border-r border-border shadow-2xl
          bg-white dark:bg-zinc-900
          transition-transform duration-300 ease-in-out
          xl:top-0 xl:h-screen xl:translate-x-0 xl:z-40 xl:shadow-none
          top-14 h-[calc(100vh-3.5rem)]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}
      >
        <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
          {/* Logo - Only visible on desktop (xl+) */}
          <Link 
            href="/" 
            className="hidden xl:flex h-16 items-center gap-3 border-b border-border px-6 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src="/logo.png"
                alt="Boss Traders Investor Class"
                fill
                className="rounded-lg object-contain"
                sizes="32px"
              />
            </div>
            <h1 className="text-xl font-bold text-foreground">Student Portal</h1>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto bg-white dark:bg-zinc-900">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors
                  ${isActiveRoute(item.href) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-foreground'
                  }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="border-t border-border p-4 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary text-primary-foreground">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name ?? 'User'}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-semibold">
                    {user.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content - Adjusted for mobile/tablet */}
      <main className="xl:pl-64 pt-14 xl:pt-0 pb-20 xl:pb-0">
        <div className="container mx-auto px-4 sm:px-6 py-6 xl:py-8">{children}</div>
      </main>

      {/* Mobile/Tablet Bottom Navigation */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors
                ${isActiveRoute(item.href) 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium truncate max-w-[60px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}















