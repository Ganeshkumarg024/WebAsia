import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    getBrandKit,
    updateBrandKit,
    uploadLogo,
    downloadAssets
} from '../controllers/brandKit.controller.js';

const router = express.Router();

// Configure multer for logo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/brand-kits/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// All routes require authentication
router.use(authenticate);

// Get brand kit
router.get('/', getBrandKit);

// Update brand kit
router.put('/', updateBrandKit);

// Upload logo
router.post('/logo', upload.single('logo'), uploadLogo);

// Download assets
router.get('/download', downloadAssets);

export default router;
