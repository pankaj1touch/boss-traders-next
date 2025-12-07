'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Video, ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetUserRegistrationsQuery } from '@/store/api/demoClassApi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { useDemoClassSocket } from '@/hooks/useSocket';
import Link from 'next/link';

export default function DemoClassRegistrationsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Poll every 30 seconds for status updates (fallback)
  const { data, isLoading, refetch } = useGetUserRegistrationsQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60000, // Reduced to 60 seconds since we have WebSocket
  });

  // Listen to WebSocket events for real-time updates
  useDemoClassSocket((updateData) => {
    // Refetch registrations when status changes
    refetch();
    
    if (updateData.approvalStatus === 'approved') {
      dispatch(
        addToast({
          type: 'success',
          message: `Your registration for "${updateData.demoClassTitle}" has been approved!`,
        })
      );
    } else if (updateData.approvalStatus === 'rejected') {
      dispatch(
        addToast({
          type: 'error',
          message: `Your registration for "${updateData.demoClassTitle}" has been rejected.`,
        })
      );
    }
  });

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const getApprovalStatusVariant = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'warning';
    }
  };

  const getPaymentStatusVariant = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const registrations = data?.registrations || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/account')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Button>
            <h1 className="text-4xl font-bold">My Demo Class Registrations</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View and manage your demo class registrations
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <Card className="py-20 text-center">
              <Video className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">No registrations yet</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                You haven't registered for any demo classes yet
              </p>
              <Button onClick={() => router.push('/demo-classes')}>Browse Demo Classes</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration: any) => {
                const demoClass = registration.demoClassId;
                const isApproved = registration.approvalStatus === 'approved';
                const isRejected = registration.approvalStatus === 'rejected';
                const isPending = registration.approvalStatus === 'pending' || !registration.approvalStatus;

                return (
                  <motion.div
                    key={registration._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className={`${
                      isApproved ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20' :
                      isRejected ? 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20' :
                      'border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-4 flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-foreground">
                                  {demoClass?.title || 'Demo Class'}
                                </h3>
                                {demoClass?.courseId && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Course: {typeof demoClass.courseId === 'object' 
                                      ? demoClass.courseId.title 
                                      : 'N/A'}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                <Badge variant={getApprovalStatusVariant(registration.approvalStatus)}>
                                  {isApproved ? '✓ Approved' :
                                   isRejected ? '✗ Rejected' :
                                   '⏳ Pending Approval'}
                                </Badge>
                                {registration.paymentStatus && (
                                  <Badge variant={getPaymentStatusVariant(registration.paymentStatus)}>
                                    Payment: {registration.paymentStatus === 'completed' ? 'Completed' :
                                              registration.paymentStatus === 'failed' ? 'Failed' :
                                              'Pending'}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {demoClass?.scheduledAt && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Date:</span>
                                  <span>{format(new Date(demoClass.scheduledAt), 'MMM dd, yyyy • hh:mm a')}</span>
                                </div>
                              )}
                              {demoClass?.duration && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Duration:</span>
                                  <span>{demoClass.duration} minutes</span>
                                </div>
                              )}
                              {demoClass?.instructorId && (
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Instructor:</span>
                                  <span>{typeof demoClass.instructorId === 'object' 
                                    ? demoClass.instructorId.name 
                                    : 'N/A'}</span>
                                </div>
                              )}
                              {demoClass?.price !== undefined && demoClass.price > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">Fee:</span>
                                  <span>₹{demoClass.price}</span>
                                </div>
                              )}
                            </div>

                            {registration.notes && (
                              <div className="mb-4 rounded-lg bg-accent/50 p-3">
                                <p className="text-sm font-medium mb-1">Your Notes:</p>
                                <p className="text-sm text-muted-foreground">{registration.notes}</p>
                              </div>
                            )}

                            {registration.adminNotes && (
                              <div className={`mb-4 rounded-lg p-3 ${
                                isApproved ? 'bg-green-100 dark:bg-green-900/30' :
                                isRejected ? 'bg-red-100 dark:bg-red-900/30' :
                                'bg-yellow-100 dark:bg-yellow-900/30'
                              }`}>
                                <p className="text-sm font-medium mb-1">Admin Notes:</p>
                                <p className="text-sm text-muted-foreground">{registration.adminNotes}</p>
                              </div>
                            )}

                            {isApproved && (
                              <div className="mt-4 rounded-lg bg-green-100 dark:bg-green-900/30 p-3">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                  ✓ Your registration has been confirmed! You can attend the demo class.
                                </p>
                              </div>
                            )}

                            {isRejected && (
                              <div className="mt-4 rounded-lg bg-red-100 dark:bg-red-900/30 p-3">
                                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                  ✗ Your registration has been rejected. Please contact support if you have questions.
                                </p>
                              </div>
                            )}

                            <div className="mt-4 text-xs text-muted-foreground">
                              Registered on: {format(new Date(registration.createdAt), 'MMM dd, yyyy • hh:mm a')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

