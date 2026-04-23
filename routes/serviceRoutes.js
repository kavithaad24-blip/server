import express from 'express';
import { 
  getAllServices, 
  predictServiceDelay, 
  getUserServiceRequests, 
  trackServiceRequest, 
  submitServiceRequest 
} from '../controllers/serviceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoints
router.get('/services', getAllServices);
router.get('/services/:id/predict', authMiddleware, predictServiceDelay);

// Protected endpoints
router.get('/service-requests', authMiddleware, getUserServiceRequests);
router.post('/service-requests/track', authMiddleware, trackServiceRequest);
router.post('/service-requests/submit', authMiddleware, submitServiceRequest);

export default router;
