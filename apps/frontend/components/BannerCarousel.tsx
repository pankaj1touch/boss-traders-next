'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetActiveBannersQuery } from '@/store/api/bannerApi';
import { Button } from './ui/Button';

export function BannerCarousel() {
  const { data, isLoading, error } = useGetActiveBannersQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = data?.banners || [];

  // Auto-rotate banners every 20 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="relative h-[500px] w-full bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container-custom flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null; // Don't show anything if there are no banners
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative h-[500px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            {currentBanner.imageUrl && (
              <div className="absolute inset-0">
                <Image
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title}
                  fill
                  className="object-cover"
                  priority={currentIndex === 0}
                  sizes="100vw"
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
              </div>
            )}

            {/* Content */}
            <div className="container-custom relative z-10 flex h-full items-center">
              <div className="max-w-2xl space-y-6 text-white">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
                >
                  {currentBanner.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-white/90 md:text-xl"
                >
                  {currentBanner.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    Learn More
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              aria-label="Next banner"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

