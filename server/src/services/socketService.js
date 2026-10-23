import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { geoService } from './geoService.js';
import { kafkaProducerService } from './kafkaProducer.js';
import { Ride } from '../models/Ride.js';
import { Driver } from '../models/Driver.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    },
    pingTimeout: 30000,
    pingInterval: 15000
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'oxima_super_secure_jwt_secret_key_2026_dev_mode');
        socket.userId = decoded.id;
        socket.role = decoded.role;
      } catch (err) {
        logger.warn(`Socket auth failed: ${err.message}`);
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket Connected: ${socket.id} | User: ${socket.userId || 'Guest'}`);

    // Join personal user room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Driver specific initialization
    socket.on('driver:join', async (driverId) => {
      if (!driverId) return;
      socket.driverId = driverId;
      socket.join(`driver:${driverId}`);
      logger.info(`Driver ${driverId} connected to driver cockpit.`);
    });

    // Driver location update stream (Only when online and app is open)
    socket.on('driver:location:update', async (data) => {
      const { driverId, latitude, longitude, heading = 0, speed = 0, status = 'ONLINE', activeRideId } = data;
      if (!driverId || latitude === undefined || longitude === undefined) return;

      // 1. Update Redis Geospatial cache & Mongo
      await geoService.updateDriverLocation(driverId, longitude, latitude, heading, status);

      // 2. Stream to Kafka
      kafkaProducerService.streamDriverLocation(driverId, latitude, longitude, heading, speed);

      // 3. Broadcast to active ride room if driver is on a ride
      if (activeRideId) {
        io.to(`ride:${activeRideId}`).emit('ride:driver:location', {
          driverId,
          latitude,
          longitude,
          heading,
          speed
        });
      }

      // 4. Broadcast to Admin Fleet map
      io.to('admin:fleet').emit('fleet:driver:moved', {
        driverId,
        latitude,
        longitude,
        heading,
        status
      });
    });

    // Driver manual toggle online / offline
    socket.on('driver:status:toggle', async ({ driverId, status }) => {
      if (!driverId) return;
      if (status === 'OFFLINE') {
        await geoService.removeDriverLocation(driverId);
      }
      await Driver.findByIdAndUpdate(driverId, { status });
      io.to('admin:fleet').emit('fleet:driver:status', { driverId, status });
    });

    // Join ride room for tracking
    socket.on('ride:join', (rideId) => {
      if (rideId) {
        socket.join(`ride:${rideId}`);
        logger.info(`Socket ${socket.id} joined ride:${rideId}`);
      }
    });

    // Join Admin Fleet room
    socket.on('admin:join', () => {
      socket.join('admin:fleet');
      logger.info(`Socket ${socket.id} joined admin:fleet`);
    });

    // Automatic Offline transition on disconnection / closing app
    socket.on('disconnect', async () => {
      logger.info(`Socket Disconnected: ${socket.id}`);
      if (socket.driverId) {
        try {
          const driver = await Driver.findById(socket.driverId);
          // If the driver is not in the middle of a trip, switch to OFFLINE immediately
          if (driver && driver.status !== 'ON_TRIP') {
            driver.status = 'OFFLINE';
            await driver.save();
            await geoService.removeDriverLocation(socket.driverId);
            io.to('admin:fleet').emit('fleet:driver:status', { driverId: socket.driverId, status: 'OFFLINE' });
            logger.info(`Driver ${socket.driverId} automatically set to OFFLINE upon app exit.`);
          }
        } catch (err) {
          logger.warn(`Error on driver disconnect handler: ${err.message}`);
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToDriver = (driverId, event, data) => {
  if (io) {
    io.to(`driver:${driverId}`).emit(event, data);
  }
};

export const emitToRide = (rideId, event, data) => {
  if (io) {
    io.to(`ride:${rideId}`).emit(event, data);
  }
};

export const emitToFleet = (event, data) => {
  if (io) {
    io.to('admin:fleet').emit(event, data);
  }
};
