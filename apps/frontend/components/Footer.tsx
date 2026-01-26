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
    <footer className="relative border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-[#0B0F19] overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand & Social - 4 Columns */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Boss Traders Investor Class"
                width={60}
                height={60}
                className="rounded-xl shadow-lg shadow-blue-500/10"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Boss Traders</span>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest">Investor Class</span>
              </div>
            </Link>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed text-balance">
              Empowering traders and investors with premium education. Master global markets with expert guidance and proven strategies.
            </p>

            <div className="flex gap-3">
              {!isLoading && socialLinks.map((social) => {
                const Icon = platformIcons[social.platform];
                if (!Icon) return null;

                return (
                  <a
                    key={social._id}
                    href={social.url}
                    className="glass-card flex items-center justify-center w-10 h-10 rounded-full text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all duration-300"
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

          {/* Links - 5 Columns (2+2+1 structure visually, but using standard grid cols here) */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Dynamic Link Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="col-span-1">
                <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  {category}
                </h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:pl-1 transition-all duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter Column */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Stay Updated
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Join our newsletter for daily market insights.
              </p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    aria-label="Subscribe"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Boss Traders Investor Class. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400 dark:text-gray-600">
              Premium Trading Education
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

