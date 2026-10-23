import express from 'express';
import { z } from 'zod';
import {
  getDashboardStats,
  getCitySurges,
  setSurgeMultiplier,
  toggleDriverVerification
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

const surgeSchema = z.object({
  body: z.object({
    cityId: z.string().optional(),
    multiplier: z.number().min(1.0).max(5.0)
  })
});

router.get('/stats', getDashboardStats);
router.get('/surge', getCitySurges);
router.post('/surge', validate(surgeSchema), setSurgeMultiplier);
router.patch('/drivers/:driverId/verify', toggleDriverVerification);

export default router;
