import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (): Socket | null => {
  // Don't create multiple connections
  if (socket?.connected) {
    return socket;
  }

  // Get token from localStorage (same as authSlice uses)
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  const socketUrl = apiBase.replace('/api', '');

  if (!token) {
    console.warn('No access token found, socket connection will fail');
    return null;
  }

  socket = io(socketUrl, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

