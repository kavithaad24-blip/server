import express from 'express';
import { createComplaint, getUserComplaints, getComplaints, predictComplaintDelay } from '../controllers/complaintController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createComplaint);
router.get('/', getComplaints);
router.get('/user-complaints', authMiddleware, getUserComplaints);
router.post('/predict-delay', authMiddleware, predictComplaintDelay);

export default router;
