import express from 'express';
import { z } from 'zod';
import {
  estimateFare,
  createRide,
  getActiveRide,
  getRideById,
  cancelRide,
  dismissRide,
  rateRide,
  getRideHistory
} from '../controllers/rideController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = express.Router();

const estimateSchema = z.object({
  body: z.object({
    pickupLng: z.number(),
    pickupLat: z.number(),
    destLng: z.number(),
    destLat: z.number(),
    pickupAddress: z.string().optional(),
    destAddress: z.string().optional()
  })
});

const createRideSchema = z.object({
  body: z.object({
    pickup: z.object({
      address: z.string(),
      location: z.object({
        type: z.literal('Point').default('Point'),
        coordinates: z.array(z.number()).length(2)
      })
    }),
    destination: z.object({
      address: z.string(),
      location: z.object({
        type: z.literal('Point').default('Point'),
        coordinates: z.array(z.number()).length(2)
      })
    }),
    vehicleType: z.enum(['Moto', 'Auto', 'Mini', 'Sedan', 'SUV', 'Electric']).default('Mini'),
    routePolyline: z.array(z.array(z.number())).optional(),
    paymentMethod: z.enum(['CASH', 'UPI']).default('CASH')
  })
});

const rateSchema = z.object({
  body: z.object({
    score: z.number().min(1).max(5),
    review: z.string().optional()
  })
});

// Fare estimate (public or authenticated)
router.post('/estimate', validate(estimateSchema), estimateFare);

// Protected routes
router.use(protect);

router.post('/request', validate(createRideSchema), createRide);
router.get('/active', getActiveRide);
router.get('/history', getRideHistory);
router.get('/:id', getRideById);
router.patch('/:id/cancel', cancelRide);
router.post('/:id/dismiss', dismissRide);
router.post('/:id/rate', validate(rateSchema), rateRide);

export default router;
