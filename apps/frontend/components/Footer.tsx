'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGetActiveSocialLinksQuery } from '@/store/api/socialLinkApi';
import { platformIcons } from '@/store/api/socialLinkApi';

export function Footer() {
  const { data, isLoading } = useGetActiveSocialLinksQuery();
  const socialLinks = data?.socialLinks || [];

  const footerLinks = {
    product: [
      { label: 'Courses', href: '/courses' },
      { label: 'Live Classes', href: '/live' },
      { label: 'eBooks', href: '/ebooks' },
      { label: 'Pricing', href: '/pricing' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="container-custom py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Boss Traders Investor Class"
                width={100}
                height={100}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Boss Traders Investor Class</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Empowering traders and investors with premium education. Learn from the best, master trading strategies, 
              and achieve financial success through expert guidance.
            </p>
            <div className="mt-6 flex gap-4">
              {!isLoading && socialLinks.map((social) => {
                const Icon = platformIcons[social.platform];
                if (!Icon) return null;
                
                return (
                  <a
                    key={social._id}
                    href={social.url}
                    className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    aria-label={social.platform}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Boss Traders Investor Class. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

