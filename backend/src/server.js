import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import winston from 'winston';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { setupSocketIO } from './services/socketService.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

// Winston Logger Configuration
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Validate required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
  logger.warn('⚠️  Warning: JWT_SECRET is not set or using default value. This is insecure for production!');
}

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Socket.IO Setup
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

setupSocketIO(io);

// Make io accessible to routes
app.set('io', io);

/**
 * Security headers with Helmet.
 * CSP allows images from any HTTPS source for Cloudinary compatibility.
 * Cross-origin embedder policy is disabled to allow third-party resources.
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

/**
 * Compress response bodies to reduce bandwidth usage.
 * Particularly beneficial for JSON API responses and static assets.
 */
app.use(compression());

// CORS
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
} else {
  app.use(morgan('dev'));
}

/**
 * Attach unique request IDs for distributed tracing and debugging.
 * Useful for correlating logs across multiple services and requests.
 */
app.use((req, res, next) => {
  req.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// Health check with detailed info
app.get('/api/v1/health', (req, res) => {
  const healthcheck = {
    success: true,
    message: 'Server is running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
  };
  res.json(healthcheck);
});

// API documentation endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'Smart Restaurant API',
    version: '1.0.0',
    description: 'RESTful API for Smart Restaurant Management System',
    endpoints: {
      auth: '/api/v1/auth',
      menu: '/api/v1/menu',
      orders: '/api/v1/orders',
      reservations: '/api/v1/reservations',
      feedback: '/api/v1/feedback',
      ai: '/api/v1/ai',
      analytics: '/api/v1/analytics',
      reviews: '/api/v1/reviews',
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-restaurant';
    await mongoose.connect(mongoURI);
    logger.info('✅ MongoDB connected');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error.message);

    if (retries > 0) {
      logger.info(`Retrying connection... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  httpServer.close(async () => {
    logger.info('HTTP server closed');

    try {
      await mongoose.connection.close(false);
      logger.info('MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

/**
 * Initializes database connection and starts the HTTP server.
 * Database connection is established before accepting requests to ensure app is ready.
 */
const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📱 Frontend URL: ${FRONTEND_URL}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔌 WebSocket enabled`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

/**
 * Gracefully shut down on uncaught exceptions to prevent undefined state.
 * In production, terminates immediately; in dev, allows for debugging.
 */
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

/**
 * Handle graceful shutdown on termination signals (SIGTERM/SIGINT).
 * Allows in-flight requests to complete before closing connections.
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

export { io, logger };
