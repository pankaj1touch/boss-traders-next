'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Info, DollarSign, BookOpen, GraduationCap, Settings, Sparkles, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Announcement } from '@/store/api/announcementApi';

const typeIcons = {
  general: Info,
  course: BookOpen,
  payment: DollarSign,
  educational: GraduationCap,
  system: Settings,
  promotion: Sparkles,
};

const typeColors = {
  general: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  course: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  educational: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  system: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  promotion: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

interface AnnouncementCardProps {
  announcement: Announcement;
  index?: number;
  onView?: (id: string) => void;
  onClick?: (announcement: Announcement) => void;
}

export function AnnouncementCard({ announcement, index = 0, onView, onClick }: AnnouncementCardProps) {
  const TypeIcon = typeIcons[announcement.type] || Info;

  const handleClick = () => {
    if (announcement.linkUrl && onClick) {
      onClick(announcement);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        {announcement.imageUrl && (
          <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
            <Image
              src={announcement.imageUrl}
              alt={announcement.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={typeColors[announcement.type]}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {announcement.type}
              </Badge>
              <Badge className={priorityColors[announcement.priority]}>
                {announcement.priority}
              </Badge>
            </div>
          </div>
        )}

        <CardContent className="p-6">
          {/* Header */}
          {!announcement.imageUrl && (
            <div className="mb-4 flex items-center gap-2">
              <TypeIcon className="h-5 w-5 text-muted-foreground" />
              <Badge className={typeColors[announcement.type]}>{announcement.type}</Badge>
              <Badge className={priorityColors[announcement.priority]}>{announcement.priority}</Badge>
            </div>
          )}

          {/* Title */}
          <h3 className="mb-2 text-lg font-bold text-foreground line-clamp-2">{announcement.title}</h3>

          {/* Description */}
          {announcement.description && (
            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
              {announcement.description}
            </p>
          )}

          {/* Body Preview */}
          {announcement.body && (
            <p className="mb-4 text-sm text-foreground line-clamp-3">{announcement.body}</p>
          )}

          {/* Link */}
          {announcement.linkUrl && (
            <Link href={announcement.linkUrl} onClick={handleClick}>
              <Button variant="outline" size="sm" className="w-full gap-2">
                {announcement.linkText || 'Learn More'}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

