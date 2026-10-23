import express from 'express';
import { z } from 'zod';
import { register, login, getMe, topupWallet } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(8, 'Phone number is required'),
    role: z.enum(['rider', 'driver', 'admin']).optional(),
    upiId: z.string().optional(),
    vehicle: z.object({
      make: z.string().optional(),
      model: z.string().optional(),
      year: z.number().optional(),
      color: z.string().optional(),
      licensePlate: z.string().optional(),
      rcNumber: z.string().optional(),
      type: z.enum(['Moto', 'Auto', 'Mini', 'Sedan', 'SUV', 'Electric']).optional()
    }).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/wallet/topup', protect, topupWallet);

export default router;
