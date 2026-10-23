import express from 'express';
import { z } from 'zod';
import {
  getDriverProfile,
  updateDriverProfile,
  updateStatus,
  updateLocation,
  acceptRide,
  arriveAtPickup,
  startRide,
  completeRide
} from '../controllers/driverController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('driver', 'admin'));

const statusSchema = z.object({
  body: z.object({
    status: z.enum(['ONLINE', 'OFFLINE'])
  })
});

const locationSchema = z.object({
  body: z.object({
    longitude: z.number(),
    latitude: z.number(),
    heading: z.number().optional()
  })
});

const startRideSchema = z.object({
  body: z.object({
    otp: z.string().length(4, 'PIN must be 4 digits')
  })
});

router.get('/profile', getDriverProfile);
router.patch('/profile', updateDriverProfile);
router.patch('/status', validate(statusSchema), updateStatus);
router.post('/location', validate(locationSchema), updateLocation);
router.post('/rides/:rideId/accept', acceptRide);
router.post('/rides/:rideId/arrived', arriveAtPickup);
router.post('/rides/:rideId/start', validate(startRideSchema), startRide);
router.post('/rides/:rideId/complete', completeRide);

export default router;
