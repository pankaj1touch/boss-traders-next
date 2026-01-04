'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Info, DollarSign, BookOpen, GraduationCap, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetActiveAnnouncementsQuery, useTrackAnnouncementViewMutation, useTrackAnnouncementClickMutation } from '@/store/api/announcementApi';
import type { Announcement } from '@/store/api/announcementApi';

const typeIcons = {
  general: Info,
  course: BookOpen,
  payment: DollarSign,
  educational: GraduationCap,
  system: Settings,
  promotion: Sparkles,
};

const priorityStyles = {
  high: {
    bg: 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30',
    border: 'border-red-200 dark:border-red-900',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-900 dark:text-red-100',
  },
  medium: {
    bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30',
    border: 'border-yellow-200 dark:border-yellow-900',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-900 dark:text-yellow-100',
  },
  low: {
    bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
  },
};

interface AnnouncementBannerProps {
  priority?: 'high' | 'medium' | 'low';
  maxAnnouncements?: number;
}

export function AnnouncementBanner({ priority, maxAnnouncements = 1 }: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [trackedViews, setTrackedViews] = useState<Set<string>>(new Set());

  const { data, isLoading } = useGetActiveAnnouncementsQuery({
    priority: priority || undefined,
  });
  const [trackView] = useTrackAnnouncementViewMutation();
  const [trackClick] = useTrackAnnouncementClickMutation();

  // Load dismissed announcements from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('dismissedAnnouncements');
      if (dismissed) {
        try {
          setDismissedIds(JSON.parse(dismissed));
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
    }
  }, []);

  // Filter announcements
  const announcements = useMemo(
    () =>
      data?.announcements
        ?.filter((announcement: Announcement) => !dismissedIds.includes(announcement._id))
        .slice(0, maxAnnouncements) || [],
    [data?.announcements, dismissedIds, maxAnnouncements]
  );

  // Track view on mount
  useEffect(() => {
    announcements.forEach((announcement) => {
      if (!trackedViews.has(announcement._id)) {
        trackView(announcement._id).catch(console.error);
        setTrackedViews((prev) => new Set(prev).add(announcement._id));
      }
    });
  }, [announcements, trackedViews, trackView]);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
    }
  };

  const handleClick = async (announcement: Announcement) => {
    if (announcement.linkUrl) {
      await trackClick(announcement._id).catch(console.error);
    }
  };

  if (isLoading || announcements.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {announcements.map((announcement) => {
        const styles = priorityStyles[announcement.priority];
        const Icon = typeIcons[announcement.type] || Info;

        return (
          <motion.div
            key={announcement._id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`sticky top-0 z-50 border-b ${styles.border} ${styles.bg} shadow-sm`}
          >
            <div className="container-custom">
              <div className="flex items-center gap-4 py-3 px-4">
                {/* Icon */}
                <Icon className={`h-5 w-5 flex-shrink-0 ${styles.icon}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <h3 className={`font-semibold ${styles.text} text-sm sm:text-base`}>
                      {announcement.title}
                    </h3>
                  </div>
                  {announcement.description && (
                    <p className={`text-xs sm:text-sm mt-1 ${styles.text} opacity-90 line-clamp-1`}>
                      {announcement.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {announcement.linkUrl && (
                    <Link href={announcement.linkUrl} onClick={() => handleClick(announcement)}>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs sm:text-sm border-current ${styles.text} hover:bg-white/50 dark:hover:bg-black/20`}
                      >
                        {announcement.linkText || 'Learn More'}
                      </Button>
                    </Link>
                  )}
                  <button
                    onClick={() => handleDismiss(announcement._id)}
                    className={`p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors ${styles.text}`}
                    aria-label="Dismiss announcement"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

