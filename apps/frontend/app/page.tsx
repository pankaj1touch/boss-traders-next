'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award, TrendingUp, AlertCircle, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CourseCard } from '@/components/CourseCard';
import { BlogCard } from '@/components/BlogCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetCoursesQuery } from '@/store/api/courseApi';
import { useGetBlogsQuery } from '@/store/api/blogApi';

export default function HomePage() {
  const {
    data: coursesData,
    isLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useGetCoursesQuery({ limit: 6 });
  const {
    data: blogsData,
    isLoading: blogsLoading,
    isError: blogsError,
    refetch: refetchBlogs,
  } = useGetBlogsQuery({ limit: 12, sort: 'newest' });

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

      {/* Featured Blog Posts */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">Latest Blog Posts</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Stay updated with our latest insights and tutorials
            </p>
          </motion.div>

          {blogsLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : blogsError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900/50 dark:bg-red-900/20">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-6 text-2xl font-semibold">Unable to load blog posts</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Please refresh the page or try again. You can still read all articles from the blog page.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button onClick={() => refetchBlogs()}>Retry loading</Button>
                <Link href="/blog">
                  <Button variant="outline">Visit blog</Button>
                </Link>
              </div>
            </div>
          ) : blogsData?.blogs && blogsData.blogs.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogsData.blogs.slice(0, 10).map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BlogCard blog={blog} index={index} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
              <Newspaper className="mx-auto h-12 w-12 text-primary-500" />
              <h3 className="mt-6 text-2xl font-semibold">No blog posts yet</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Our editorial team is preparing fresh insights. Explore all articles or check back soon.
              </p>
              <Link href="/blog" className="mt-6 inline-block">
                <Button>
                  Go to blog
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/blog">
              <Button size="lg">
                View All Blog Posts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
          ) : coursesError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900/50 dark:bg-red-900/20">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-6 text-2xl font-semibold">Courses failed to load</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Something went wrong while fetching featured courses. Please try again.
              </p>
              <Button className="mt-6" onClick={() => refetchCourses()}>
                Retry loading
              </Button>
            </div>
          ) : coursesData?.courses?.length ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {coursesData?.courses.map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
              <BookOpen className="mx-auto h-12 w-12 text-primary-500" />
              <h3 className="mt-6 text-2xl font-semibold">No featured courses yet</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Check back soon for curated picks, or browse the course catalog to start learning today.
              </p>
              <Link href="/courses" className="mt-6 inline-block">
                <Button>
                  Browse all courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
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

