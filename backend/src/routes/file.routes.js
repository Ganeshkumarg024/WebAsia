import express from 'express';
import {
    uploadFile,
    uploadMultipleFiles,
    getRequestFiles,
    getFileDownloadUrl,
    deleteFile,
    streamFile,
    getFiles
} from '../controllers/file.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadSingle, uploadMultiple, handleMulterError } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload single file
router.post('/upload', uploadSingle('file'), handleMulterError, uploadFile);

// Bulk upload files for a request
router.post('/bulk', uploadMultiple('files'), handleMulterError, uploadMultipleFiles);

// Stream a file securely (Local storage proxy)
router.get('/stream/:id', streamFile);

// Get files for a request
router.get('/request/:requestId', getRequestFiles);

// Get download URL for a file
router.get('/:id/download', getFileDownloadUrl);

// Get all files
router.get('/', getFiles);

// Delete file
router.delete('/:id', deleteFile);

export default router;
