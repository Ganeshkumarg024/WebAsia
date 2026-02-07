import express from 'express';
import { body } from 'express-validator';
import {
    register,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    verifyOtp,
    resendOtp
} from '../controllers/auth.controller.js';
import {
    requestPasswordReset,
    resetPassword,
    sendVerificationEmail,
    verifyEmail
} from '../controllers/passwordReset.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('role').isIn(['client', 'designer', 'manager', 'admin', 'affiliate']).withMessage('Valid role required'),
    body('phone').optional().isString()
], register);

router.post('/login', [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
], login);

router.post('/logout', authenticate, logout);

router.post('/refresh', [
    body('refreshToken').notEmpty().withMessage('Refresh token required')
], refreshToken);

router.post('/verify-otp', [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], verifyOtp);

router.post('/resend-otp', [
    body('email').isEmail().withMessage('Valid email required')
], resendOtp);

router.get('/me', authenticate, getCurrentUser);

// Password reset routes
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email required')
], requestPasswordReset);

router.post('/reset-password', [
    body('token').notEmpty().withMessage('Reset token required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], resetPassword);

// Email verification routes
router.post('/send-verification', authenticate, sendVerificationEmail);

router.post('/verify-email', [
    body('token').notEmpty().withMessage('Verification token required')
], verifyEmail);

export default router;
