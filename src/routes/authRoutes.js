import express from 'express';
import {
  register,
  login,
  protectedRoute,
  adminRoute
} from '../controllers/authController.js';

import authenticateJWT from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/protected', authenticateJWT, protectedRoute);
router.get('/admin', authenticateJWT, adminRoute);

export default router;
