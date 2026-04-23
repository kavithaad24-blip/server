import express from 'express';
import { getLocalIssues, voteForIssue, getIssueStats } from '../controllers/issueController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all local issues with user's vote status
router.get('/', authMiddleware, getLocalIssues);

// Vote/unvote for an issue
router.post('/vote', authMiddleware, voteForIssue);

// Get voting statistics
router.get('/stats', authMiddleware, getIssueStats);

export default router;