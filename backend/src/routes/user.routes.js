import express from 'express';
import { body } from 'express-validator';
import {
    getProfile,
    updateProfile,
    uploadAvatar,
    changePassword
} from '../controllers/user.controller.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', getProfile);

// Update profile
router.put('/me', [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone(),
    body('bio').optional().trim(),
    body('timezone').optional().isString(),
    body('language').optional().isString()
], updateProfile);

// Upload avatar
router.post('/me/avatar', uploadSingle('avatar'), uploadAvatar);

// Change password
router.post('/change-password', [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number')
], changePassword);

export default router;
