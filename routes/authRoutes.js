import express from 'express';
import { signup, login, updateProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/profile', updateProfile);

export default router;
