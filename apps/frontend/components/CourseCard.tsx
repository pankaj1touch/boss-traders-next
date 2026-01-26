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
        <div className="group h-full rounded-2xl border border-white/5 bg-brand-navy hover:shadow-neon-gold transition-all duration-300 overflow-hidden relative">
          <div className="relative h-48 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent z-10" />
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-blue to-brand-purple">
                <BookOpen className="h-16 w-16 text-white/50" />
              </div>
            )}
            <div className="absolute left-4 top-4 z-20">
              <Badge className="bg-brand-dark/90 text-white backdrop-blur-md border border-white/10">{course.level}</Badge>
            </div>
            {hasDiscount && (
              <div className="absolute right-4 top-4 z-20">
                <Badge variant="danger" className="animate-pulse">
                  {Math.round(((course.price - course.salePrice!) / course.price) * 100)}% OFF
                </Badge>
              </div>
            )}
          </div>

          <div className="p-6 relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="outline" className="border-brand-blue/30 text-brand-blue bg-brand-blue/5">{course.category}</Badge>
              <Badge variant="secondary" className="bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20">{course.modality}</Badge>
            </div>

            <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white group-hover:text-brand-gold transition-colors">{course.title}</h3>

            <p className="mb-4 line-clamp-2 text-sm text-gray-400">
              {course.description}
            </p>

            <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1 text-brand-gold">
                <Star className="h-4 w-4 fill-brand-gold" />
                <span className="font-medium">{course.rating.toFixed(1)}</span>
                <span className="text-gray-500">({course.ratingCount})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{course.language}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                {hasDiscount && (
                  <span className="mr-2 text-sm text-gray-500 line-through">
                    {formatPrice(course.price)}
                  </span>
                )}
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-neon">{formatPrice(price)}</span>
              </div>
              <motion.div
                whileHover={{ x: 5 }}
                className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

