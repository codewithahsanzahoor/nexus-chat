import express from 'express';
import { registerUser, loginUser, getUsers, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, getUsers);
router.put('/update-profile', protect, updateProfile);

export default router;