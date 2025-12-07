'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MapPin, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import {
  useGetDemoClassByIdQuery,
  useRegisterForDemoClassMutation,
  useGetUserRegistrationsQuery,
} from '@/store/api/demoClassApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import Link from 'next/link';

export default function RegisterDemoClassPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const demoClassId = params.id as string;

  const { data, isLoading } = useGetDemoClassByIdQuery(demoClassId);
  const { data: userRegistrations } = useGetUserRegistrationsQuery(undefined, { skip: !isAuthenticated });
  const [registerForDemoClass, { isLoading: isRegistering }] = useRegisterForDemoClassMutation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = `/demo-classes/${demoClassId}/register`;
      const redirectUrl = encodeURIComponent(currentPath);
      dispatch(
        addToast({
          type: 'info',
          message: 'Please login or signup to register for demo classes',
        })
      );
      router.push(`/auth/login?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, isLoading, demoClassId, router, dispatch]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (data?.isRegistered) {
      dispatch(addToast({ type: 'info', message: 'You are already registered for this demo class' }));
      router.push('/demo-classes');
    }
  }, [data?.isRegistered, dispatch, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      const currentPath = `/demo-classes/${demoClassId}/register`;
      const redirectUrl = encodeURIComponent(currentPath);
      dispatch(
        addToast({
          type: 'warning',
          message: 'Please login to register for demo classes',
        })
      );
      router.push(`/auth/login?redirect=${redirectUrl}`);
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      dispatch(addToast({ type: 'error', message: 'Please fill in all required fields' }));
      return;
    }

    try {
      const result = await registerForDemoClass({
        id: demoClassId,
        data: formData,
      }).unwrap();

      if (result.requiresPayment && result.order) {
        // Redirect to checkout page for payment
        dispatch(
          addToast({
            type: 'info',
            message: 'Please complete payment to confirm your registration',
          })
        );
        router.push(`/checkout/${result.order._id}`);
      } else {
        // No payment required, waiting for admin approval
        dispatch(
          addToast({
            type: 'success',
            message: 'Registration submitted successfully! Waiting for admin approval.',
          })
        );
        router.push('/demo-classes');
      }
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error.data?.message || 'Failed to register for demo class',
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20">
          <div className="animate-pulse">
            <div className="mb-8 h-64 rounded-3xl bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  // Show loading or redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!data?.demoClass) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <h1 className="text-4xl font-bold">Demo class not found</h1>
          <Link href="/demo-classes" className="mt-4 text-primary-600 hover:underline">
            Back to Demo Classes
          </Link>
        </div>
      </div>
    );
  }

  const { demoClass } = data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <section className="py-12">
        <div className="container-custom">
          <Link
            href="/demo-classes"
            className="mb-6 inline-flex items-center gap-2 text-primary-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Demo Classes
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Demo Class Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="primary">{demoClass.status}</Badge>
                    {demoClass.courseId && (
                      <Link
                        href={`/courses/${demoClass.courseId.slug}`}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        View Course
                      </Link>
                    )}
                  </div>
                  <CardTitle className="text-3xl">{demoClass.title}</CardTitle>
                  {demoClass.description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{demoClass.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(demoClass.scheduledAt), 'EEEE, MMMM dd, yyyy • hh:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{demoClass.duration} minutes</p>
                      </div>
                    </div>
                    {demoClass.locationId && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {demoClass.locationId.name}
                            {demoClass.locationId.address && `, ${demoClass.locationId.address}`}
                            {demoClass.locationId.city && `, ${demoClass.locationId.city}`}
                          </p>
                        </div>
                      </div>
                    )}
                    {demoClass.instructorId && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium">Instructor</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {demoClass.instructorId.name}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="font-medium">Availability</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {demoClass.registeredCount} / {demoClass.maxAttendees} registered
                        </p>
                      </div>
                    </div>
                    {demoClass.price !== undefined && demoClass.price > 0 && (
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">Registration Fee</p>
                          <p className="text-lg font-bold text-primary-600">₹{demoClass.price}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-20"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Register for Demo Class</CardTitle>
                  {demoClass.price !== undefined && demoClass.price > 0 && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Registration fee: <span className="font-bold text-primary-600">₹{demoClass.price}</span>
                    </p>
                  )}
                  {(!demoClass.price || demoClass.price === 0) && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Free demo class - No payment required
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="mb-2 block text-sm font-medium">
                        Additional Notes (Optional)
                      </label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any questions or special requests..."
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isRegistering || demoClass.registeredCount >= demoClass.maxAttendees}
                    >
                      {isRegistering
                        ? 'Registering...'
                        : demoClass.registeredCount >= demoClass.maxAttendees
                          ? 'Class Full'
                          : 'Register Now'}
                    </Button>

                    {demoClass.registeredCount >= demoClass.maxAttendees && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        This demo class is full. Please check other available sessions.
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

