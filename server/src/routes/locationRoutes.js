import express from 'express';
import { getCitySuggestions, getAvailableCities } from '../controllers/locationController.js';

const router = express.Router();

router.get('/search', getCitySuggestions);
router.get('/cities', getAvailableCities);

export default router;
