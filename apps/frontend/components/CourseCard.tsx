'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, BookOpen } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatPrice } from '@/lib/utils';
import type { Course } from '@/store/api/courseApi';

interface CourseCardProps {
  course: Course;
  index?: number;
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const price = course.salePrice || course.price;
  const hasDiscount = !!course.salePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/courses/${course.slug}`}>
        <Card hover className="h-full overflow-hidden">
          <div className="relative h-48 w-full">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-600">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
            )}
            <div className="absolute left-4 top-4">
              <Badge variant="primary">{course.level}</Badge>
            </div>
            {hasDiscount && (
              <div className="absolute right-4 top-4">
                <Badge variant="danger">
                  {Math.round(((course.price - course.salePrice!) / course.price) * 100)}% OFF
                </Badge>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="mb-2 flex items-center gap-2">
              <Badge>{course.category}</Badge>
              <Badge variant="secondary">{course.modality}</Badge>
            </div>

            <h3 className="mb-2 line-clamp-2 text-lg font-bold">{course.title}</h3>

            <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {course.description}
            </p>

            <div className="mb-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating.toFixed(1)}</span>
                <span>({course.ratingCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.language}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {hasDiscount && (
                  <span className="mr-2 text-sm text-gray-500 line-through">
                    {formatPrice(course.price)}
                  </span>
                )}
                <span className="text-2xl font-bold text-primary-600">{formatPrice(price)}</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

