'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { BookOpen, Play, ArrowLeft, Clock, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetStudentCoursesQuery } from '@/store/api/studentApi';
import { useAppSelector } from '@/store/hooks';

export default function AccountCoursesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading, error } = useGetStudentCoursesQuery();

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const courses = data?.courses ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/account')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Account
              </Button>
              <h1 className="text-4xl font-bold">My Courses</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Courses you have purchased and enrolled in
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : error ? (
            <Card className="py-20 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">Error Loading Courses</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                There was an error loading your courses. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </Card>
          ) : courses.length === 0 ? (
            <Card className="py-20 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">No Courses Yet</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                You haven&apos;t purchased any courses yet. Browse our course catalog to get started.
              </p>
              <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((item, index) => (
                <motion.div
                  key={item.enrollmentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative h-48 w-full overflow-hidden">
                      {item.course.thumbnail ? (
                        <Image
                          src={item.course.thumbnail}
                          alt={item.course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-blue to-brand-purple">
                          <BookOpen className="h-16 w-16 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute left-4 top-4 z-10">
                        <Badge className="bg-brand-dark/90 text-white backdrop-blur-md border border-white/10">
                          {item.course.level}
                        </Badge>
                      </div>
                      <div className="absolute right-4 top-4 z-10">
                        <Badge
                          variant={item.status === 'active' ? 'success' : 'warning'}
                          className="backdrop-blur-md"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <Badge variant="outline" className="border-brand-blue/30 text-brand-blue bg-brand-blue/5">
                          {item.course.category}
                        </Badge>
                        {item.course.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-brand-gold">
                            <Star className="h-3 w-3 fill-brand-gold" />
                            <span className="font-medium">{item.course.rating.toFixed(1)}</span>
                            {item.course.ratingCount > 0 && (
                              <span className="text-gray-500">({item.course.ratingCount})</span>
                            )}
                          </div>
                        )}
                      </div>

                      <h3 className="mb-2 line-clamp-2 text-lg font-bold text-foreground group-hover:text-brand-gold transition-colors">
                        {item.course.title}
                      </h3>

                      <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Enrolled {format(new Date(item.enrolledAt), 'dd MMM yyyy')}</span>
                      </div>

                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-foreground">{item.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                            className="h-full bg-gradient-to-r from-brand-blue to-brand-purple"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Badge variant="secondary" className="text-xs">
                          {item.accessTier}
                        </Badge>
                        <Link href={`/courses/${item.course.slug}/learn`}>
                          <Button
                            size="sm"
                            className="inline-flex items-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            {item.progress > 0 ? 'Continue' : 'Start'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
