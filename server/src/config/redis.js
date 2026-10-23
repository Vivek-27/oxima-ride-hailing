import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
  lazyConnect: true
};

export const redisClient = new Redis(redisConfig);
export const redisSubscriber = new Redis(redisConfig);

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    await redisSubscriber.connect();
    logger.redis(`Redis Connected to ${redisConfig.host}:${redisConfig.port}`);
  } catch (err) {
    logger.warn(`Redis connection warning: ${err.message}. Continuing with local fallback state.`);
  }
};

redisClient.on('error', (err) => {
  logger.warn(`Redis Client Error: ${err.message}`);
});

redisSubscriber.on('error', (err) => {
  logger.warn(`Redis Subscriber Error: ${err.message}`);
});
