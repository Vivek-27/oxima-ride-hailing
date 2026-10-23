import http from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { connectRedis, redisClient } from './config/redis.js';
import { connectKafka } from './config/kafka.js';
import { startKafkaConsumers } from './services/kafkaConsumer.js';
import { initSocket } from './services/socketService.js';
import { Driver } from './models/Driver.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize WebSockets
initSocket(httpServer);

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Connect Redis
    await connectRedis();

    // 3. Reset all inactive drivers to OFFLINE on startup (Only drivers using the app and toggling online will show as ONLINE)
    await Driver.updateMany({ status: { $ne: 'ON_TRIP' } }, { status: 'OFFLINE' });
    if (redisClient.status === 'ready') {
      await redisClient.del('oxima:drivers:locations');
    }
    logger.info('Driver fleet status initialized: All inactive drivers set to OFFLINE.');

    // 4. Connect Kafka
    await connectKafka();

    // 5. Start Kafka Consumers
    await startKafkaConsumers();

    // 6. Start listening
    httpServer.listen(PORT, () => {
      logger.success(`🚀 Oxima Backend Server is running on port ${PORT}`);
      logger.info(`🔗 API Health: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error(`Failed to bootstrap server: ${error.message}`, error.stack);
    process.exit(1);
  }
};

// Global unhandled rejection and exception handlers
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`, err.stack);
});

process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`, err.stack);
  process.exit(1);
});

startServer();
