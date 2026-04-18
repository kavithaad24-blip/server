import express from 'express';
import { testMessage } from '../controllers/testController.js';

const router = express.Router();

router.get('/test', testMessage);

export default router;
