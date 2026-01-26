'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, BookOpen, Users, Check, Play, Calendar, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetCourseBySlugQuery, useGetRecommendedVideosQuery } from '@/store/api/courseApi';
import VideoRecommendations from '@/components/course/VideoRecommendations';
import { useGetDemoClassesQuery } from '@/store/api/demoClassApi';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading } = useGetCourseBySlugQuery(slug);
  const { data: demoClassesData } = useGetDemoClassesQuery({ courseId: data?.course?._id });
  const redirectToCart = encodeURIComponent('/cart');

  const handleAddToCart = () => {
    if (data?.course) {
      dispatch(
        addToCart({
          id: data.course._id,
          type: 'course',
          title: data.course.title,
          price: data.course.salePrice || data.course.price,
          thumbnail: data.course.thumbnail,
        })
      );
      dispatch(addToast({ type: 'success', message: 'Added to cart!' }));
    }
  };

  const handleEnroll = () => {
    handleAddToCart();

    if (!isAuthenticated) {
      dispatch(
        addToast({
          type: 'info',
          message: 'Create your student account to confirm enrollment.',
        })
      );
      router.push(`/auth/signup?redirect=${redirectToCart}`);
      return;
    }

    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20">
          <div className="animate-pulse">
            <div className="mb-8 h-64 rounded-3xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <h1 className="text-4xl font-bold">Course not found</h1>
        </div>
      </div>
    );
  }

  const { course, modules, lessons, feedback, isEnrolled } = data;
  const price = course.salePrice || course.price;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      {/* Hero */}
      <section className="relative bg-brand-dark py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-purple/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

        <div className="container-custom relative z-10">
          <div className="grid gap-12 lg:grid-cols-3 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <div className="mb-6 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-brand-blue text-brand-blue bg-brand-blue/10">{course.category}</Badge>
                <Badge className="bg-white/10 text-white border border-white/10">{course.level}</Badge>
                <Badge variant="secondary" className="bg-brand-purple/10 text-brand-purple border border-brand-purple/20">{course.modality}</Badge>
              </div>

              <h1 className="mb-6 text-4xl font-bold lg:text-6xl text-white leading-tight">
                {course.title}
              </h1>

              <p className="mb-8 text-xl text-gray-300 leading-relaxed font-light">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                  <Star className="h-4 w-4 fill-brand-gold text-brand-gold" />
                  <span className="font-bold text-white">{course.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({course.ratingCount} ratings)</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                  <Users className="h-4 w-4 text-brand-blue" />
                  <span className="text-gray-300">{course.ratingCount}+ students</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                  <Clock className="h-4 w-4 text-brand-purple" />
                  <span className="text-gray-300">{course.language}</span>
                </div>
              </div>
            </motion.div>

            {/* Sticky Buy Box */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-24"
            >
              <div className="glass-card overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-brand-blue to-brand-purple blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />

                <div className="relative bg-brand-navy/90 backdrop-blur-xl">
                  {course.thumbnail && (
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image src={course.thumbnail} alt={course.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy to-transparent" />
                    </div>
                  )}
                  <CardContent className="p-8 relative">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-white">{formatPrice(price)}</span>
                        {course.salePrice && (
                          <span className="text-lg text-gray-500 line-through decoration-red-500/50 decoration-2">{formatPrice(course.price)}</span>
                        )}
                      </div>
                      {course.salePrice && (
                        <div className="mt-2 text-sm text-brand-gold font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Limited time offer
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {isEnrolled ? (
                        <Button
                          className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white shadow-neon text-lg h-12"
                          size="lg"
                          onClick={() => router.push(`/courses/${slug}/learn`)}
                        >
                          <Play className="mr-2 h-5 w-5 fill-current" />
                          Continue Learning
                        </Button>
                      ) : (
                        <>
                          <Button className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-white shadow-lg shadow-brand-blue/20 text-lg h-12 border-0" size="lg" onClick={handleEnroll}>
                            Enroll Now
                          </Button>
                          <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white hover:text-white" onClick={handleAddToCart}>
                            Add to Cart
                          </Button>
                        </>
                      )}
                    </div>

                    <p className="mt-6 text-xs text-center text-gray-500">
                      30-Day Money-Back Guarantee • Lifetime Access
                    </p>
                  </CardContent>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-brand-dark min-h-screen relative">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container-custom relative z-10">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* What you'll learn */}
              <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-brand-navy/50">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <div className="h-8 w-1 bg-brand-green rounded-full" />
                  What you'll learn
                </h2>
                <ul className="grid gap-4 md:grid-cols-2">
                  {course.outcomes.map((outcome, index) => (
                    <li key={index} className="flex gap-3 items-start group">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-brand-green/20 flex items-center justify-center border border-brand-green/30 group-hover:bg-brand-green/30 transition-colors">
                        <Check className="h-3 w-3 text-brand-green" />
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Course Videos */}
              {course.videos && course.videos.length > 0 && (
                <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-brand-navy/50">
                  <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <div className="h-8 w-1 bg-brand-blue rounded-full" />
                    Course Preview
                    <span className="text-sm font-normal text-gray-500 ml-auto">({course.videos.length} videos)</span>
                  </h2>

                  <div className="space-y-3">
                    {[...course.videos]
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .slice(0, 5)
                      .map((video, index) => (
                        <div
                          key={video._id || index}
                          className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4 transition-all hover:bg-white/5 hover:border-white/10 group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 group-hover:bg-brand-blue/20 transition-colors">
                              <Play className="h-5 w-5 text-brand-blue ml-0.5" />
                            </div>
                            <div>
                              <p className="font-medium text-white group-hover:text-brand-blue transition-colors line-clamp-1">{video.title}</p>
                              <div className="mt-1 flex items-center gap-3 text-sm text-gray-400">
                                {video.duration && (
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.floor(video.duration / 60)} min</span>
                                )}
                                {!video.videoUrl || video.videoUrl.trim() === '' ? (
                                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 h-5 px-2 text-[10px]">Not Available</Badge>
                                ) : null}
                                {video.isFree && <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20 h-5 px-2 text-[10px]">Free Preview</Badge>}
                              </div>
                            </div>
                          </div>
                          {video.isFree && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/courses/${slug}/learn`)}
                              className="text-white hover:text-brand-blue hover:bg-white/5"
                            >
                              Watch
                            </Button>
                          )}
                        </div>
                      ))}
                    {course.videos.length > 5 && (
                      <div className="pt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/courses/${slug}/learn`)}
                          className="border-white/10 text-white hover:bg-white/5 hover:text-white hover:border-white/20"
                        >
                          View Full Curriculum
                        </Button>
                      </div>
                    )}
                    {isEnrolled && course.videos.length <= 5 && (
                      <div className="pt-4 text-center">
                        <Button onClick={() => router.push(`/courses/${slug}/learn`)} className="bg-brand-blue text-white shadow-neon hover:bg-brand-blue/90 w-full">
                          <Play className="mr-2 h-4 w-4 fill-current" />
                          Start Learning
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Curriculum */}
              <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-brand-navy/50">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <div className="h-8 w-1 bg-brand-purple rounded-full" />
                  Course Curriculum
                </h2>
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module._id} className="rounded-xl border border-white/5 bg-black/20 overflow-hidden">
                      <div className="p-4 bg-white/5 border-b border-white/5">
                        <h3 className="font-semibold text-white">{module.title}</h3>
                      </div>
                      <div className="p-2 space-y-1">
                        {lessons
                          .filter((lesson) => lesson.moduleId === module._id)
                          .map((lesson) => (
                            <div key={lesson._id} className="flex items-center justify-between text-sm p-3 rounded-lg hover:bg-white/5 transition-colors group">
                              <div className="flex items-center gap-3">
                                <Play className="h-4 w-4 text-gray-500 group-hover:text-brand-purple transition-colors" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">{lesson.title}</span>
                                {lesson.isFree && <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20 h-5 px-2 text-[10px]">Free</Badge>}
                              </div>
                              <span className="text-gray-500 text-xs">{lesson.durationMins} min</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo Classes */}
              {demoClassesData?.demoClasses && demoClassesData.demoClasses.filter((dc) => dc.status === 'scheduled').length > 0 && (
                <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-brand-navy/50">
                  <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <div className="h-8 w-1 bg-brand-neon rounded-full" />
                    Live Demo Classes
                  </h2>
                  <div className="space-y-4">
                    {demoClassesData.demoClasses
                      .filter((dc) => dc.status === 'scheduled')
                      .slice(0, 3)
                      .map((demoClass) => (
                        <div
                          key={demoClass._id}
                          className="rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:border-brand-neon/30 hover:shadow-neon-glow group"
                        >
                          <div className="mb-3 flex items-start justify-between">
                            <h4 className="font-bold text-lg text-white group-hover:text-brand-neon transition-colors">{demoClass.title}</h4>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (!isAuthenticated) {
                                  // Auth logic... 
                                  const redirectPath = `/demo-classes/${demoClass._id}/register`;
                                  dispatch(addToast({ type: 'info', message: 'Please login or signup' }));
                                  router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
                                  return;
                                }
                                router.push(`/demo-classes/${demoClass._id}/register`);
                              }}
                              className="bg-brand-neon/20 text-brand-neon border border-brand-neon/50 hover:bg-brand-neon hover:text-black"
                            >
                              Register Free
                            </Button>
                          </div>
                          {demoClass.description && (
                            <p className="mb-4 text-sm text-gray-400 line-clamp-2">
                              {demoClass.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400 border-t border-white/5 pt-3">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-brand-blue" />
                              <span className="text-white">{format(new Date(demoClass.scheduledAt), 'MMM dd, hh:mm a')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-brand-purple" />
                              <span>{demoClass.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-brand-green" />
                              <span>
                                <span className="text-white">{demoClass.registeredCount}</span>/{demoClass.maxAttendees}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    {demoClassesData.demoClasses.filter((dc) => dc.status === 'scheduled').length > 3 && (
                      <Link href="/demo-classes" className="block text-center text-brand-blue hover:text-brand-neon transition-colors mt-4 text-sm font-medium">
                        View all upcoming demo classes →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {feedback.length > 0 && (
                <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-brand-navy/50">
                  <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <div className="h-8 w-1 bg-brand-gold rounded-full" />
                    Student Success Stories
                  </h2>
                  <div className="space-y-6">
                    {feedback.map((review) => (
                      <div key={review._id} className="border-b border-white/5 pb-6 last:border-0 hover:bg-white/5 p-4 rounded-xl transition-colors">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-sm font-bold text-white">
                            {review.userId?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{review.userId?.name || 'Anonymous'}</div>
                            <div className="flex gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < review.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="text-gray-300 italic">"{review.comment}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-brand-navy/50">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-brand-blue" /> Prerequisites
                </h3>
                <ul className="space-y-3">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex gap-3 text-sm text-gray-300">
                      <span className="text-brand-blue mt-1">•</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-brand-navy/50">
                <h3 className="font-bold text-white mb-4">Course Specifications</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400">Level</span>
                    <span className="font-medium text-white bg-white/10 px-2 py-0.5 rounded">{course.level}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400">Language</span>
                    <span className="font-medium text-white">{course.language}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400">Total Enrolled</span>
                    <span className="font-medium text-white">{course.ratingCount}+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="font-medium text-white">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-12 bg-muted/30">
        <div className="container-custom">
          <VideoRecommendations />
        </div>
      </section>

      <Footer />
    </div>
  );
}

