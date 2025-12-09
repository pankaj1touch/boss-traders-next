'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award, TrendingUp, AlertCircle, Newspaper, LineChart, BarChart3, DollarSign, Target, Zap, Calendar, Clock, MapPin, User, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CourseCard } from '@/components/CourseCard';
import { BlogCard } from '@/components/BlogCard';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetCoursesQuery } from '@/store/api/courseApi';
import { useGetBlogsQuery } from '@/store/api/blogApi';
import { useGetActiveBannersQuery } from '@/store/api/bannerApi';
import { useGetDemoClassesQuery } from '@/store/api/demoClassApi';
import { useGetActiveAnnouncementsQuery, useTrackAnnouncementClickMutation } from '@/store/api/announcementApi';
import { useGetActiveCouponsQuery } from '@/store/api/couponApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { format } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { CouponCard } from '@/components/CouponCard';

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
  const {
    data: bannersData,
    isLoading: bannersLoading,
  } = useGetActiveBannersQuery();
  const {
    data: demoClassesData,
    isLoading: demoClassesLoading,
  } = useGetDemoClassesQuery({});
  const {
    data: announcementsData,
    isLoading: announcementsLoading,
  } = useGetActiveAnnouncementsQuery({});
  const {
    data: couponsData,
    isLoading: couponsLoading,
  } = useGetActiveCouponsQuery();
  const [trackAnnouncementClick] = useTrackAnnouncementClickMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const banners = bannersData?.banners || [];

  // Auto-rotate banners every 20 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const features = [
    {
      icon: LineChart,
      title: 'Technical Analysis',
      description: 'Master candlestick patterns, indicators, and chart analysis from expert traders',
    },
    {
      icon: Users,
      title: 'Live Trading Sessions',
      description: 'Watch real-time market analysis and live trading with professional instructors',
    },
    {
      icon: Award,
      title: 'Trading Certificates',
      description: 'Get certified in stock market trading and technical analysis',
    },
    {
      icon: TrendingUp,
      title: 'Profit Strategies',
      description: 'Learn proven strategies to maximize profits and minimize risks',
    },
  ];

  const announcements = announcementsData?.announcements || [];
  const highPriorityAnnouncements = announcements.filter((a) => a.priority === 'high');
  const otherAnnouncements = announcements.filter((a) => a.priority !== 'high').slice(0, 3);

  const handleAnnouncementClick = async (announcement: any) => {
    if (announcement.linkUrl) {
      try {
        await trackAnnouncementClick(announcement._id).unwrap();
      } catch (error) {
        console.error('Failed to track click:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      {/* High Priority Announcement Banner */}
      {highPriorityAnnouncements.length > 0 && (
        <AnnouncementBanner priority="high" maxAnnouncements={1} />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 blur-3xl"
          />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <AnimatePresence mode="wait">
                {bannersLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  </div>
                ) : banners.length > 0 ? (
                  <motion.div
                    key={currentBannerIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      <Zap className="h-4 w-4" />
                      Master Trading & Investing
                    </motion.div>

                    {/* Banner Title */}
                    <motion.h1
                      key={`banner-title-${currentBannerIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="mb-6 text-5xl font-bold leading-tight lg:text-6xl"
                    >
                      {banners[currentBannerIndex]?.title || (
                        <>
                          Master the Art of{' '}
                          <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Trading
                          </span>
                        </>
                      )}
                    </motion.h1>

                    {/* Banner Description */}
                    <motion.p
                      key={`banner-desc-${currentBannerIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="mb-8 text-xl text-gray-700 dark:text-gray-300"
                    >
                      {banners[currentBannerIndex]?.description || 
                        'Learn from expert traders, master technical analysis, and build profitable trading strategies. Join live trading sessions and transform your financial future.'}
                    </motion.p>
                    
                    {/* Stats */}
                    <div className="mb-8 flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                          <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Active Traders</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">95%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Link href="/courses">
                        <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
                          Explore Trading Courses
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/auth/signup">
                        <Button size="lg" variant="outline" className="border-2">
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <div>
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      <Zap className="h-4 w-4" />
                      Master Trading & Investing
                    </motion.div>

                    <h1 className="mb-6 text-5xl font-bold leading-tight lg:text-6xl">
                      Master the Art of{' '}
                      <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Trading
                      </span>
                    </h1>
                    <p className="mb-8 text-xl text-gray-700 dark:text-gray-300">
                      Learn from expert traders, master technical analysis, and build profitable trading strategies. 
                      Join live trading sessions and transform your financial future.
                    </p>
                    
                    {/* Stats */}
                    <div className="mb-8 flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                          <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Active Traders</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">95%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Link href="/courses">
                        <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
                          Explore Trading Courses
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/auth/signup">
                        <Button size="lg" variant="outline" className="border-2">
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Banner Image with Auto-Rotation - Full Image Display */}
              {bannersLoading ? (
                <div className="relative h-[450px] w-full rounded-3xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                </div>
              ) : banners.length > 0 ? (
                <div className="relative h-[450px] w-full rounded-3xl overflow-hidden bg-gray-900 shadow-2xl flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {banners[currentBannerIndex]?.imageUrl && (
                      <motion.div
                        key={currentBannerIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ 
                          duration: 0.8, 
                          ease: [0.4, 0, 0.2, 1] // Custom easing for smoother animation
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Image
                          src={banners[currentBannerIndex].imageUrl}
                          alt={banners[currentBannerIndex].title || 'Banner'}
                          fill
                          className="object-contain"
                          priority={currentBannerIndex === 0}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dots Indicator */}
                  {banners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                      {banners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBannerIndex(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentBannerIndex
                              ? 'w-8 bg-white'
                              : 'w-2 bg-white/50 hover:bg-white/75'
                          }`}
                          aria-label={`Go to banner ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-[450px] w-full rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center shadow-2xl">
                  <div className="text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Master Trading & Investing</h2>
                    <p className="text-lg text-white/80">Start your journey today</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {otherAnnouncements.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 text-center"
            >
              <h2 className="mb-2 text-3xl font-bold text-foreground">Announcements</h2>
              <p className="text-muted-foreground">Stay updated with our latest news and updates</p>
            </motion.div>

            {announcementsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherAnnouncements.map((announcement, index) => (
                  <AnnouncementCard
                    key={announcement._id}
                    announcement={announcement}
                    index={index}
                    onClick={handleAnnouncementClick}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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
            <h2 className="mb-4 text-4xl font-bold">Why Choose Boss Traders</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to master trading and build a profitable portfolio
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

      {/* Demo Classes Section */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">Upcoming Demo Classes</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Experience our courses with free demo sessions before you enroll
            </p>
          </motion.div>

          {demoClassesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : demoClassesData?.demoClasses && demoClassesData.demoClasses.filter((dc) => dc.status === 'scheduled').length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {demoClassesData.demoClasses
                  .filter((dc) => dc.status === 'scheduled')
                  .slice(0, 3)
                  .map((demoClass, index) => (
                    <motion.div
                      key={demoClass._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full transition-shadow hover:shadow-lg">
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-start justify-between">
                            <Badge variant="primary">Demo Class</Badge>
                            {demoClass.courseId && (
                              <Link
                                href={`/courses/${demoClass.courseId.slug}`}
                                className="text-xs text-primary-600 hover:underline"
                              >
                                View Course
                              </Link>
                            )}
                          </div>
                          <h3 className="mb-2 text-xl font-bold">{demoClass.title}</h3>
                          {demoClass.description && (
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {demoClass.description}
                            </p>
                          )}
                          <div className="mb-4 space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(demoClass.scheduledAt), 'MMM dd, yyyy • hh:mm a')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span>{demoClass.duration} minutes</span>
                            </div>
                            {demoClass.locationId && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4" />
                                <span className="line-clamp-1">
                                  {demoClass.locationId.name}
                                  {demoClass.locationId.city && `, ${demoClass.locationId.city}`}
                                </span>
                              </div>
                            )}
                            {demoClass.instructorId && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <User className="h-4 w-4" />
                                <span>{demoClass.instructorId.name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Users className="h-4 w-4" />
                              <span>
                                {demoClass.registeredCount} / {demoClass.maxAttendees} registered
                              </span>
                            </div>
                            {demoClass.price !== undefined && demoClass.price > 0 && (
                              <div className="flex items-center gap-2 font-semibold text-primary-600">
                                <span>₹{demoClass.price}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full"
                            disabled={demoClass.registeredCount >= demoClass.maxAttendees}
                            onClick={() => {
                              if (!isAuthenticated) {
                                const redirectPath = `/demo-classes/${demoClass._id}/register`;
                                dispatch(
                                  addToast({
                                    type: 'info',
                                    message: 'Please login or signup to register for demo classes',
                                  })
                                );
                                router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
                                return;
                              }
                              router.push(`/demo-classes/${demoClass._id}/register`);
                            }}
                          >
                            {demoClass.registeredCount >= demoClass.maxAttendees
                              ? 'Class Full'
                              : demoClass.price && demoClass.price > 0
                                ? `Register - ₹${demoClass.price}`
                                : 'Register for Demo Class'}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
              <div className="mt-12 text-center">
                <Link href="/demo-classes">
                  <Button size="lg">
                    View All Demo Classes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
              <Video className="mx-auto h-12 w-12 text-primary-500" />
              <h3 className="mt-6 text-2xl font-semibold">No demo classes scheduled</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Check back soon for upcoming demo sessions, or explore our courses to get started.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link href="/courses">
                  <Button>
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo-classes">
                  <Button variant="outline">View Demo Classes</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Active Coupons Section */}
      {!couponsLoading && couponsData?.coupons && Array.isArray(couponsData.coupons) && couponsData.coupons.length > 0 && (
        <section className="py-20">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold">Special Offers & Coupons</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Use these coupon codes to get amazing discounts on your purchases
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {couponsData.coupons.slice(0, 6).map((coupon) => {
                if (!coupon || !coupon._id) return null;
                return (
                  <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                    onApply={(code) => {
                      router.push('/cart');
                      dispatch(addToast({ type: 'info', message: `Coupon ${code} copied! Go to cart to apply.` }));
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

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
            <h2 className="mb-4 text-4xl font-bold">Ready to Master Trading?</h2>
            <p className="mb-8 text-xl">
              Join thousands of successful traders and start your profitable journey today
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

