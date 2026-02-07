import { File, Request, User } from '../models/index.js';
import config from '../config/index.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    getRequestFilePath,
    ensureDirectoryExists,
    generateUniqueFilename,
    isAllowedFileType,
    deleteFile as deleteFileUtil,
    getRelativePath
} from '../utils/fileUtils.js';

/**
 * Upload file to request
 */
export const uploadRequestFile = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { fileCategory = 'other' } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_FILE',
                    message: 'No file provided'
                }
            });
        }

        // Verify request exists
        const request = await Request.findByPk(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'REQUEST_NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Check authorization
        const isAuthorized =
            request.clientId === req.user.id ||
            request.assignedDesignerId === req.user.id ||
            request.assignedManagerId === req.user.id ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        // Log file type for debugging
        console.log('💾 Saving file:', req.file.originalname, 'MIME type:', req.file.mimetype);

        // Create file record
        const file = await File.create({
            requestId,
            uploadedBy: req.user.id,
            uploadedByRole: req.user.role,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileType: req.body.fileType || 'other',
            fileCategory,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            filePath: getRelativePath(req.file.path),
            metadata: {
                uploadedAt: new Date(),
                uploadedFrom: req.ip
            }
        });

        // Include uploader info in response
        const fileWithUploader = await File.findByPk(file.id, {
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'firstName', 'lastName', 'role'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: fileWithUploader
        });
    } catch (error) {
        console.error('Upload file error:', error);
        // Clean up file if it was uploaded
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('Error deleting file:', e);
            }
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'File upload failed'
            }
        });
    }
};

/**
 * Upload multiple files to request
 */
export const uploadMultipleRequestFiles = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { fileCategory = 'other' } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_FILES',
                    message: 'No files provided'
                }
            });
        }

        // Verify request
        const request = await Request.findByPk(requestId);
        if (!request) {
            // Delete all uploaded files
            req.files.forEach(file => fs.unlinkSync(file.path));
            return res.status(404).json({
                success: false,
                error: {
                    code: 'REQUEST_NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Check authorization
        const isAuthorized =
            request.clientId === req.user.id ||
            request.assignedDesignerId === req.user.id ||
            request.assignedManagerId === req.user.id ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            req.files.forEach(file => fs.unlinkSync(file.path));
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        // Create file records
        const filePromises = req.files.map(async (uploadedFile) => {
            // Log file type for debugging
            console.log('💾 Saving file:', uploadedFile.originalname, 'MIME type:', uploadedFile.mimetype);

            return File.create({
                requestId,
                uploadedBy: req.user.id,
                uploadedByRole: req.user.role,
                fileName: uploadedFile.filename,
                originalName: uploadedFile.originalname,
                fileType: req.body.fileType || 'other',
                fileCategory,
                mimeType: uploadedFile.mimetype,
                fileSize: uploadedFile.size,
                filePath: getRelativePath(uploadedFile.path),
                metadata: {
                    uploadedAt: new Date(),
                    uploadedFrom: req.ip
                }
            });
        });

        const files = await Promise.all(filePromises);

        // Fetch files with uploader info
        const filesWithUploaders = await File.findAll({
            where: { id: files.map(f => f.id) },
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'firstName', 'lastName', 'role'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: `${files.length} files uploaded successfully`,
            data: filesWithUploaders
        });
    } catch (error) {
        console.error('Upload multiple files error:', error);
        // Clean up uploaded files
        if (req.files) {
            req.files.forEach(file => {
                try {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                } catch (e) {
                    console.error('Error deleting file:', e);
                }
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: error.message || 'File upload failed'
            }
        });
    }
};

/**
 * Get all files for a request
 */
export const getRequestFiles = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { fileCategory, uploadedByRole } = req.query;

        // Verify request exists and user has access
        const request = await Request.findByPk(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'REQUEST_NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Check authorization
        const isAuthorized =
            request.clientId === req.user.id ||
            request.assignedDesignerId === req.user.id ||
            request.assignedManagerId === req.user.id ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        const where = { requestId, isActive: true, isVisible: true };
        if (fileCategory) where.fileCategory = fileCategory;
        if (uploadedByRole) where.uploadedByRole = uploadedByRole;

        const files = await File.findAll({
            where,
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'firstName', 'lastName', 'role', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });

        // Group files by role
        const groupedFiles = {
            clientFiles: files.filter(f => f.uploadedByRole === 'client'),
            designerFiles: files.filter(f => f.uploadedByRole === 'designer'),
            adminFiles: files.filter(f => f.uploadedByRole === 'admin')
        };

        res.json({
            success: true,
            data: {
                all: files,
                grouped: groupedFiles
            }
        });
    } catch (error) {
        console.error('Get request files error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch files'
            }
        });
    }
};

/**
 * Download file
 */
export const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findByPk(fileId, {
            include: [{ model: Request, as: 'request' }]
        });

        if (!file || !file.isActive) {
            console.log('❌ File not found or inactive in database:', fileId);
            return res.status(404).json({
                success: false,
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: 'File not found'
                }
            });
        }

        // Check authorization
        const request = file.request;
        const isAuthorized =
            file.uploadedBy === req.user.id ||
            request.clientId === req.user.id ||
            request.assignedDesignerId === req.user.id ||
            request.assignedManagerId === req.user.id ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        // Resolve absolute file path correctly
        let storagePath = file.filePath;
        const localPath = config.storage.localPath || 'uploads';

        // Check if the path already starts with the uploads folder
        const normalizedPath = storagePath.replace(/\\/g, '/');
        const normalizedLocal = localPath.replace(/\\/g, '/');

        if (!normalizedPath.startsWith(normalizedLocal + '/')) {
            storagePath = path.join(localPath, storagePath);
        }

        const filePath = path.join(process.cwd(), storagePath);

        if (!fs.existsSync(filePath)) {
            console.error('❌ File not found on disk at:', filePath);
            return res.status(404).json({
                success: false,
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: 'File not found on server'
                }
            });
        }

        // Increment download count
        await file.increment('downloadCount');

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimeType);

        // Stream file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to download file'
            }
        });
    }
};

/**
 * Delete file
 */
export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findByPk(fileId, {
            include: [{ model: Request, as: 'request' }]
        });

        if (!file) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: 'File not found'
                }
            });
        }

        // Check authorization (only uploader or admin can delete)
        if (file.uploadedBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        // Soft delete (mark as inactive)
        await file.update({ isActive: false });

        // Optionally delete physical file
        // const filePath = path.join(process.cwd(), file.filePath);
        // deleteFileUtil(filePath);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to delete file'
            }
        });
    }
};

/**
 * Configure multer for request file uploads
 */
export const configureRequestFileUpload = () => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const { requestId } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            const uploadPath = getRequestFilePath(userId, requestId, userRole);
            ensureDirectoryExists(uploadPath);

            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueFilename = generateUniqueFilename(file.originalname);
            cb(null, uniqueFilename);
        }
    });

    const fileFilter = (req, file, cb) => {
        // Log the file type for debugging
        console.log('📎 Uploading file:', file.originalname, 'MIME type:', file.mimetype);

        // Temporarily allow all file types for testing
        cb(null, true);

        /* Uncomment this when you want to re-enable file type validation
        if (isAllowedFileType(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
        */
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB per file
        }
    });
};
