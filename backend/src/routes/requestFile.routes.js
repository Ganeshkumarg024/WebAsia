import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    uploadRequestFile,
    uploadMultipleRequestFiles,
    getRequestFiles,
    downloadFile,
    deleteFile,
    configureRequestFileUpload
} from '../controllers/requestFile.controller.js';

const router = express.Router();

// Configure multer upload
const upload = configureRequestFileUpload();

// All routes require authentication
router.use(authenticate);

// Upload single file to request
router.post(
    '/request/:requestId/upload',
    upload.single('file'),
    uploadRequestFile
);

// Upload multiple files to request
router.post(
    '/request/:requestId/upload-multiple',
    upload.array('files', 10), // Max 10 files
    uploadMultipleRequestFiles
);

// Get all files for a request
router.get('/request/:requestId', getRequestFiles);

// Download file
router.get('/:fileId/download', downloadFile);

// Delete file
router.delete('/:fileId', deleteFile);

export default router;
