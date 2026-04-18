import express from 'express';
import { submitAuditReport, getAuditReports, getAuditReportById } from '../controllers/auditController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Submit new audit report
router.post('/report', upload.single('image'), submitAuditReport);

// Get all audit reports
router.get('/reports', getAuditReports);

// Get specific audit report
router.get('/reports/:id', getAuditReportById);

export default router;
