import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the upload path for request files based on user ID, request ID, and role
 * @param {string} userId - User ID
 * @param {string} requestId - Request ID
 * @param {string} role - User role ('client', 'designer', 'admin')
 * @returns {string} - Upload path
 */
export const getRequestFilePath = (userId, requestId, role) => {
    const roleFolder = role === 'designer' ? 'designer-uploads' :
        role === 'admin' ? 'admin-uploads' : 'client-uploads';

    return path.join(
        process.cwd(),
        'uploads',
        'requests',
        `client-${userId}`,
        `request-${requestId}`,
        roleFolder
    );
};

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path
 */
export const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (originalName) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    return `${sanitizedName}-${timestamp}-${random}${ext}`;
};

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human-readable file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if file type is allowed
 * @param {string} mimeType - MIME type
 * @returns {boolean} - Whether file type is allowed
 */
export const isAllowedFileType = (mimeType) => {
    const allowedTypes = [
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'image/webp',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Text
        'text/plain',
        'text/csv',
        // Archives
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        // Design files
        'application/postscript', // AI files
        'image/vnd.adobe.photoshop', // PSD files
        'application/octet-stream' // Generic binary (for PSD, AI, etc.)
    ];

    return allowedTypes.includes(mimeType);
};

/**
 * Delete file from filesystem
 * @param {string} filePath - Path to file
 */
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

/**
 * Get relative path from absolute path
 * @param {string} absolutePath - Absolute file path
 * @returns {string} - Relative path from project root
 */
export const getRelativePath = (absolutePath) => {
    const projectRoot = process.cwd();
    return path.relative(projectRoot, absolutePath);
};

/**
 * Initialize request upload folders
 */
export const initializeUploadFolders = () => {
    const baseUploadPath = path.join(process.cwd(), 'uploads', 'requests');
    ensureDirectoryExists(baseUploadPath);
    console.log('✅ Request upload folders initialized');
};
