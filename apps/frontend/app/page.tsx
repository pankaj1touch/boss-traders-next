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
      <section className="relative overflow-hidden bg-brand-dark py-14 sm:py-20 lg:py-32">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

        {/* Floating Elements */}
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-purple/30 blur-[100px] animate-pulse-slow" />
        <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-brand-blue/30 blur-[100px] animate-pulse-slow lg:delay-1000" />

        <div className="container-custom relative z-10">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                {bannersLoading ? (
                  <div className="flex h-[260px] sm:h-[400px] items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-accent border-r-transparent"></div>
                  </div>
                ) : (
                  <motion.div
                    key={currentBannerIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Premium Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-brand-gold backdrop-blur-sm"
                    >
                      <Zap className="h-4 w-4" />
                      <span className="tracking-wide uppercase">Elite Investor Class</span>
                    </motion.div>

                    {/* Headline */}
                    <h1 className="mb-5 sm:mb-6 text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-white lg:text-7xl">
                      Master the <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-purple to-brand-neon animate-gradient-x">
                        Market Moves
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-400 lg:text-xl lg:leading-relaxed max-w-lg">
                      {banners[currentBannerIndex]?.description ||
                        'Join the elite community of traders. Master technical analysis, psychology, and risk management with our institutional-grade curriculum.'}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/courses">
                        <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 shadow-neon border-0 rounded-xl transition-all hover:scale-105">
                          Explore Courses
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/auth/signup">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-xl backdrop-blur-sm">
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-gray-500">
                      <div className="flex -space-x-3 sm:-space-x-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-brand-dark bg-gray-800" />
                        ))}
                      </div>
                      <div className="text-xs sm:text-sm">
                        <span className="block font-bold text-white text-sm sm:text-base">10,000+ Traders</span>
                        Trusted by industry leaders
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right Side - 3D Floating Glass Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block perspective-1000"
            >
              <div className="relative z-10 animate-float">
                {/* Main Glass Card */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl">
                  {banners.length > 0 && banners[currentBannerIndex]?.imageUrl ? (
                    <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-inner">
                      <Image
                        src={banners[currentBannerIndex].imageUrl}
                        alt="Trading Dashboard"
                        fill
                        className="object-cover"
                      />
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-[400px] w-full rounded-2xl bg-brand-navy border border-white/5 flex items-center justify-center relative overflow-hidden">
                      {/* Abstract Chart UI */}
                      <div className="absolute inset-0 flex items-end justify-between px-8 pb-8 gap-2 opacity-50">
                        {[40, 60, 45, 70, 50, 80, 65, 90].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="w-8 rounded-t-sm bg-gradient-to-t from-brand-blue to-brand-neon/50"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Floating Stats Cards around the main card */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-8 -top-8 glass-card p-4 rounded-2xl border-l-4 border-l-brand-gold bg-brand-navy/90"
                  >
                    <div className="text-xs text-gray-400">Total Profit</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      +$12,450
                      <TrendingUp className="h-4 w-4 text-brand-gold" />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -left-8 -bottom-8 glass-card p-4 rounded-2xl border-l-4 border-l-brand-neon bg-brand-navy/90"
                  >
                    <div className="text-xs text-gray-400">Active Students</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      2,543
                      <Users className="h-4 w-4 text-brand-neon" />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Back Glow */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-blue to-brand-purple blur-[80px] opacity-40 rounded-full" />
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
              <h2 className="mb-2 text-2xl sm:text-3xl font-bold text-foreground">Announcements</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Stay updated with our latest news and updates</p>
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
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">Latest Blog Posts</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              Stay updated with our latest insights and tutorials
            </p>
          </motion.div>

          {blogsLoading ? (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : blogsError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-10 text-center dark:border-red-900/50 dark:bg-red-900/20">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold">Unable to load blog posts</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Please refresh the page or try again. You can still read all articles from the blog page.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
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
            <div className="rounded-3xl border border-dashed border-gray-300 p-6 sm:p-10 text-center dark:border-gray-700">
              <Newspaper className="mx-auto h-12 w-12 text-primary-500" />
              <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold">No blog posts yet</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
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
              <Button size="lg" className="w-full sm:w-auto">
                View All Blog Posts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">Why Choose Boss Traders</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              Everything you need to master trading and build a profitable portfolio
            </p>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="group h-full p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-brand-accent/50 transition-all duration-300">
                  <div className="h-full rounded-xl bg-brand-navy border border-white/5 p-4 sm:p-6 hover:shadow-neon transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-mesh-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                    <div className="mx-auto mb-5 sm:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-brand-slate group-hover:bg-brand-blue/20 transition-colors duration-300">
                      <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-brand-blue group-hover:text-brand-neon transition-colors duration-300" />
                    </div>

                    <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-white group-hover:text-brand-gold transition-colors">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 leading-relaxed z-10 relative">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Classes Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">Upcoming Demo Classes</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
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
                        <CardContent className="p-4 sm:p-6">
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
                          <h3 className="mb-2 text-lg sm:text-xl font-bold">{demoClass.title}</h3>
                          {demoClass.description && (
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {demoClass.description}
                            </p>
                          )}
                          <div className="mb-4 space-y-2 text-xs sm:text-sm">
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
                  <Button size="lg" className="w-full sm:w-auto">
                    View All Demo Classes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 p-6 sm:p-10 text-center dark:border-gray-700">
              <Video className="mx-auto h-12 w-12 text-primary-500" />
              <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold">No demo classes scheduled</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Check back soon for upcoming demo sessions, or explore our courses to get started.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
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
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">Special Offers & Coupons</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
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
      <section className="bg-brand-dark py-12 sm:py-16 lg:py-20 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Featured <span className="text-brand-gold">Courses</span></h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400">
              Explore our most popular trading programs
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-brand-navy border border-white/5" />
              ))}
            </div>
          ) : coursesError ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 sm:p-10 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold text-white">Courses failed to load</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-400">
                Something went wrong while fetching featured courses. Please try again.
              </p>
              <Button className="mt-6 bg-red-600 hover:bg-red-700 text-white" onClick={() => refetchCourses()}>
                Retry loading
              </Button>
            </div>
          ) : coursesData?.courses?.length ? (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 perspective-1000">
              {coursesData?.courses.map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-700 p-6 sm:p-10 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-brand-blue" />
              <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold text-white">No featured courses yet</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-400">
                Check back soon for curated picks, or browse the course catalog to start learning today.
              </p>
              <Link href="/courses" className="mt-6 inline-block w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
                  Browse all courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/courses">
              <Button size="lg" className="w-full sm:w-auto bg-brand-navy border border-white/10 hover:bg-brand-blue hover:text-white transition-all text-gray-300">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-600 p-6 sm:p-10 lg:p-12 text-center text-white"
          >
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">Ready to Master Trading?</h2>
            <p className="mb-6 sm:mb-8 text-base sm:text-lg lg:text-xl">
              Join thousands of successful traders and start your profitable journey today
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white bg-white text-primary-600 hover:bg-gray-100">
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

