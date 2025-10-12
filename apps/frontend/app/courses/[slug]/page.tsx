'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, BookOpen, Users, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetCourseBySlugQuery } from '@/store/api/courseApi';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading } = useGetCourseBySlugQuery(slug);

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
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    handleAddToCart();
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
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12 dark:from-gray-900 dark:to-gray-800">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="primary">{course.category}</Badge>
                <Badge>{course.level}</Badge>
                <Badge variant="secondary">{course.modality}</Badge>
              </div>

              <h1 className="mb-4 text-4xl font-bold lg:text-5xl">{course.title}</h1>

              <p className="mb-6 text-xl text-gray-600 dark:text-gray-300">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating.toFixed(1)}</span>
                  <span className="text-gray-600 dark:text-gray-400">({course.ratingCount} ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.ratingCount}+ students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.language}</span>
                </div>
              </div>
            </motion.div>

            {/* Sticky Buy Box */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-20"
            >
              <Card className="overflow-hidden">
                {course.thumbnail && (
                  <div className="relative h-48 w-full">
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary-600">{formatPrice(price)}</span>
                    {course.salePrice && (
                      <span className="ml-2 text-lg text-gray-500 line-through">{formatPrice(course.price)}</span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Button className="w-full" size="lg">
                      <Play className="mr-2 h-5 w-5" />
                      Continue Learning
                    </Button>
                  ) : (
                    <>
                      <Button className="mb-2 w-full" size="lg" onClick={handleEnroll}>
                        Enroll Now
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleAddToCart}>
                        Add to Cart
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* What you'll learn */}
              <Card>
                <CardHeader>
                  <CardTitle>What you'll learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3 md:grid-cols-2">
                    {course.outcomes.map((outcome, index) => (
                      <li key={index} className="flex gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Curriculum */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modules.map((module) => (
                    <div key={module._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                      <h3 className="mb-2 font-semibold">{module.title}</h3>
                      <div className="space-y-2">
                        {lessons
                          .filter((lesson) => lesson.moduleId === module._id)
                          .map((lesson) => (
                            <div key={lesson._id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Play className="h-4 w-4" />
                                <span>{lesson.title}</span>
                                {lesson.isFree && <Badge variant="success">Free</Badge>}
                              </div>
                              <span className="text-gray-500">{lesson.durationMins} min</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Reviews */}
              {feedback.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feedback.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0 dark:border-gray-800">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.userId?.name || 'Anonymous'}</span>
                        </div>
                        {review.comment && <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-gray-400">•</span>
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Level</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Language</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Students</span>
                    <span className="font-medium">{course.ratingCount}+</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

