const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

let io = null;

// Initialize Socket.IO server
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('_id name email roles');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.userId} (${socket.user.email})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join admin room if user is admin
    if (socket.user.roles && socket.user.roles.includes('admin')) {
      socket.join('admin');
      logger.info(`Admin joined admin room: ${socket.userId}`);
    }

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.userId} - Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.userId}:`, error);
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
};

// Get Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

// Emit event to specific user
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
  logger.info(`Emitted ${event} to user: ${userId}`);
};

// Emit event to all admins
const emitToAdmins = (event, data) => {
  if (!io) return;
  io.to('admin').emit(event, data);
  logger.info(`Emitted ${event} to all admins`);
};

// Emit event to all connected clients
const emitToAll = (event, data) => {
  if (!io) return;
  io.emit(event, data);
  logger.info(`Emitted ${event} to all clients`);
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToAdmins,
  emitToAll,
};

