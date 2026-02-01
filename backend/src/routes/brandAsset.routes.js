import express from 'express';
import {
    getBrandAssets,
    createBrandAsset,
    updateBrandAsset,
    deleteBrandAsset
} from '../controllers/brandAsset.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadSingle, handleMulterError } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all brand assets for the current user
router.get('/', getBrandAssets);

// Create a new brand asset (optional file upload)
router.post('/', uploadSingle('file'), handleMulterError, createBrandAsset);

// Update a brand asset
router.patch('/:id', updateBrandAsset);

// Delete a brand asset (soft delete)
router.delete('/:id', deleteBrandAsset);

export default router;
