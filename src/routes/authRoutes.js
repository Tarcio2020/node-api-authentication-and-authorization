import express from 'express';
import {
    register,
    login,
    protectedRoute,
    adminRoute
} from '../controllers/authController.js';
import {
    requestPasswordReset,
    resetPassword,
    serveResetPasswordForm
} from '../controllers/passwordResetController.js';
import authenticateJWT from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/reset-password', serveResetPasswordForm); // Nova rota para o formulário
router.get('/protected', authenticateJWT, protectedRoute);
router.get('/admin', authenticateJWT, adminRoute);

export default router;