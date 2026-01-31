import express from 'express';
import {
    uploadFile,
    uploadMultipleFiles,
    getRequestFiles,
    getFileDownloadUrl,
    deleteFile
} from '../controllers/file.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadSingle, uploadMultiple, handleMulterError } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload single file
router.post('/upload', uploadSingle('file'), handleMulterError, uploadFile);

// Upload multiple files
router.post('/upload-multiple', uploadMultiple('files', 10), handleMulterError, uploadMultipleFiles);

// Get files for a request
router.get('/request/:requestId', getRequestFiles);

// Get download URL for a file
router.get('/:id/download', getFileDownloadUrl);

// Delete file
router.delete('/:id', deleteFile);

export default router;
