'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetLiveSessionsQuery, useJoinSessionMutation } from '@/store/api/liveSessionApi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

export default function LiveSessionsPage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetLiveSessionsQuery({});
  const [joinSession] = useJoinSessionMutation();

  const handleJoin = async (sessionId: string) => {
    if (!isAuthenticated) {
      dispatch(addToast({ type: 'warning', message: 'Please login to join live sessions' }));
      return;
    }

    try {
      const result = await joinSession(sessionId).unwrap();
      window.open(result.joinLink, '_blank');
    } catch (error: any) {
      dispatch(addToast({ type: 'error', message: error.data?.message || 'Failed to join session' }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'danger';
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

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
            <h1 className="mb-4 text-5xl font-bold">Live Classes</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join interactive live sessions with expert instructors
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sessions */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : data?.sessions.length === 0 ? (
            <div className="py-20 text-center">
              <Video className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">No upcoming sessions</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for new live sessions
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data?.sessions.map((session, index) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <Badge variant={getStatusColor(session.status)}>
                          {session.status.toUpperCase()}
                        </Badge>
                        {session.maxAttendees && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4" />
                            <span>{session.maxAttendees}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="mb-3 text-lg font-bold">{session.title}</h3>

                      {session.description && (
                        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {session.description}
                        </p>
                      )}

                      <div className="mb-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(session.startAt), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(new Date(session.startAt), 'p')} -{' '}
                            {format(new Date(session.endAt), 'p')}
                          </span>
                        </div>
                      </div>

                      {session.courseId && (
                        <p className="mb-4 text-sm font-medium text-primary-600">
                          {session.courseId.title}
                        </p>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => handleJoin(session._id)}
                        disabled={session.status === 'completed' || session.status === 'cancelled'}
                      >
                        {session.status === 'live' ? 'Join Now' : 'Join Session'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

