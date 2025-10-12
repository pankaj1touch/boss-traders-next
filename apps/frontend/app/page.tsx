'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CourseCard } from '@/components/CourseCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetCoursesQuery } from '@/store/api/courseApi';

export default function HomePage() {
  const { data: coursesData, isLoading } = useGetCoursesQuery({ limit: 6 });

  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from industry experts with years of real-world experience',
    },
    {
      icon: Users,
      title: 'Live Classes',
      description: 'Interactive sessions with instructors and fellow learners',
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn recognized certificates upon course completion',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Advance your career with in-demand skills',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 py-20 dark:from-gray-900 dark:to-gray-800">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="mb-6 text-5xl font-bold leading-tight lg:text-6xl">
                Learn Without{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Limits
                </span>
              </h1>
              <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
                Access thousands of courses, live classes, and expert instructors. Start learning
                today and transform your future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/courses">
                  <Button size="lg">
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-[400px] w-full rounded-3xl bg-gradient-to-br from-primary-400 to-secondary-600 p-8 shadow-2xl">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute right-8 top-8 rounded-2xl bg-white p-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary-100" />
                    <div>
                      <div className="mb-1 h-3 w-24 rounded bg-gray-200" />
                      <div className="h-2 w-16 rounded bg-gray-100" />
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-8 left-8 rounded-2xl bg-white p-4 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-8 w-8 text-yellow-500" />
                    <div>
                      <div className="mb-1 h-3 w-20 rounded bg-gray-200" />
                      <div className="h-2 w-16 rounded bg-gray-100" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">Why Choose Us</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to succeed in your learning journey
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900">
                      <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="bg-gray-50 py-20 dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">Featured Courses</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Explore our most popular courses
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {coursesData?.courses.map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/courses">
              <Button size="lg">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-600 p-12 text-center text-white"
          >
            <h2 className="mb-4 text-4xl font-bold">Ready to Start Learning?</h2>
            <p className="mb-8 text-xl">
              Join thousands of learners and start your journey today
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="border-white bg-white text-primary-600 hover:bg-gray-100">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

