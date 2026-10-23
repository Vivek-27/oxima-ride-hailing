import express from 'express';
import { getMyTransactions } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/history', getMyTransactions);

export default router;
