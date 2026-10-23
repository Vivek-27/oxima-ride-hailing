import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

import { errorHandler } from './middlewares/errorHandler.js';
import { AppError } from './utils/AppError.js';
import { getKafkaStatus } from './config/kafka.js';
import { redisClient } from './config/redis.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health Check API
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    services: {
      server: 'UP',
      redis: redisClient.status === 'ready' ? 'UP' : 'DEGRADED',
      kafka: getKafkaStatus().connected ? 'UP' : 'LOCAL_EMBEDDED'
    }
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/locations', locationRoutes);

// Unhandled Route Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server`, 404));
});

// Global Error Middleware
app.use(errorHandler);

export default app;
