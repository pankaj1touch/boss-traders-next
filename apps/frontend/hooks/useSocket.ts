'use client';

import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useAppSelector } from '@/store/hooks';

export const useSocket = () => {
  const socketRef = useRef<ReturnType<typeof getSocket>>(null);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      socketRef.current = getSocket();
    } else {
      disconnectSocket();
      socketRef.current = null;
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
      // disconnectSocket();
    };
  }, [isAuthenticated, user]);

  return socketRef.current;
};

// Hook for listening to demo class events
export const useDemoClassSocket = (onRegistrationUpdate?: (data: any) => void) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleRegistrationApproved = (data: any) => {
      console.log('Registration approved:', data);
      onRegistrationUpdate?.(data);
    };

    const handleRegistrationRejected = (data: any) => {
      console.log('Registration rejected:', data);
      onRegistrationUpdate?.(data);
    };

    socket.on('demo_class:registration_approved', handleRegistrationApproved);
    socket.on('demo_class:registration_rejected', handleRegistrationRejected);

    return () => {
      socket.off('demo_class:registration_approved', handleRegistrationApproved);
      socket.off('demo_class:registration_rejected', handleRegistrationRejected);
    };
  }, [socket, onRegistrationUpdate]);
};

// Hook for admin to listen to new registrations
export const useAdminSocket = (onNewRegistration?: (data: any) => void) => {
  const socket = useSocket();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes('admin');

  useEffect(() => {
    if (!socket || !isAdmin) return;

    const handleNewRegistration = (data: any) => {
      console.log('New demo class registration:', data);
      onNewRegistration?.(data);
    };

    socket.on('demo_class:new_registration', handleNewRegistration);

    return () => {
      socket.off('demo_class:new_registration', handleNewRegistration);
    };
  }, [socket, isAdmin, onNewRegistration]);
};

