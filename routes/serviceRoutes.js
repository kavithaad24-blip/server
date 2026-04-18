import express from 'express';
import { 
  getAllServices, 
  getUserServiceRequests, 
  trackServiceRequest, 
  submitServiceRequest 
} from '../controllers/serviceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoint - get all services
router.get('/services', getAllServices);

// Protected endpoints
router.get('/service-requests', authMiddleware, getUserServiceRequests);
router.post('/service-requests/track', authMiddleware, trackServiceRequest);
router.post('/service-requests/submit', authMiddleware, submitServiceRequest);

export default router;
