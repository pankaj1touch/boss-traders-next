'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, User, Video } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetDemoClassesQuery } from '@/store/api/demoClassApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemoClassesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetDemoClassesQuery({});

  const handleRegister = (demoClassId: string) => {
    if (!isAuthenticated) {
      const redirectPath = `/demo-classes/${demoClassId}/register`;
      dispatch(
        addToast({
          type: 'info',
          message: 'Please login or signup to register for demo classes',
        })
      );
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
    router.push(`/demo-classes/${demoClassId}/register`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const upcoming = data?.demoClasses.filter((dc) => dc.status === 'scheduled') || [];
  const completed = data?.demoClasses.filter((dc) => dc.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12 dark:from-gray-900 dark:to-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-4 text-5xl font-bold">Demo Classes</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Experience our courses with free demo sessions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Demo Classes */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : (
            <>
              {/* Upcoming Demo Classes */}
              {upcoming.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-3xl font-bold">Upcoming Demo Classes</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((demoClass, index) => (
                      <motion.div
                        key={demoClass._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full transition-shadow hover:shadow-lg">
                          <CardHeader>
                            <div className="mb-2 flex items-start justify-between">
                              <Badge variant={getStatusColor(demoClass.status)}>{demoClass.status}</Badge>
                              {demoClass.courseId && (
                                <Link
                                  href={`/courses/${demoClass.courseId.slug}`}
                                  className="text-sm text-primary-600 hover:underline"
                                >
                                  View Course
                                </Link>
                              )}
                            </div>
                            <CardTitle className="text-xl">{demoClass.title}</CardTitle>
                            {demoClass.description && (
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {demoClass.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {format(new Date(demoClass.scheduledAt), 'MMM dd, yyyy • hh:mm a')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span>{demoClass.duration} minutes</span>
                              </div>
                              {demoClass.locationId && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <MapPin className="h-4 w-4" />
                                  <span>
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

                            <div className="pt-2">
                              <Button
                                className="w-full"
                                onClick={() => handleRegister(demoClass._id)}
                                disabled={demoClass.registeredCount >= demoClass.maxAttendees}
                              >
                                {demoClass.registeredCount >= demoClass.maxAttendees
                                  ? 'Full'
                                  : demoClass.price && demoClass.price > 0
                                    ? `Register - ₹${demoClass.price}`
                                    : 'Register for Demo Class'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Demo Classes */}
              {completed.length > 0 && (
                <div>
                  <h2 className="mb-6 text-3xl font-bold">Past Demo Classes</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {completed.map((demoClass, index) => (
                      <motion.div
                        key={demoClass._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full opacity-75">
                          <CardHeader>
                            <div className="mb-2 flex items-start justify-between">
                              <Badge variant={getStatusColor(demoClass.status)}>{demoClass.status}</Badge>
                            </div>
                            <CardTitle className="text-xl">{demoClass.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(demoClass.scheduledAt), 'MMM dd, yyyy • hh:mm a')}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {upcoming.length === 0 && completed.length === 0 && (
                <div className="py-20 text-center">
                  <Video className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    No demo classes available at the moment.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

