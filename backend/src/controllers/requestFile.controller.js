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
import { uploadFile, deleteFile as deleteFromStorage } from '../utils/storage.js';

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
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        // Log file type for debugging
        console.log('💾 Uploading file:', req.file.originalname, 'MIME type:', req.file.mimetype);

        // Upload using storage utility
        const folder = `requests/client-${request.clientId}/request-${requestId}`;
        const uploadResult = await uploadFile(req.file, folder, true);

        // Create file record
        const file = await File.create({
            requestId,
            uploadedBy: req.user.id,
            uploadedByRole: req.user.role,
            fileName: uploadResult.fileName,
            originalName: uploadResult.originalName,
            fileType: req.body.fileType || 'other',
            fileCategory,
            mimeType: uploadResult.mimeType,
            fileSize: uploadResult.fileSize,
            filePath: uploadResult.url, // Store the URL directly
            thumbnailUrl: uploadResult.thumbnailUrl,
            metadata: {
                ...uploadResult.metadata,
                storageKey: uploadResult.storageKey,
                storageBucket: uploadResult.storageBucket,
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

        // Create file records
        const folder = `requests/client-${request.clientId}/request-${requestId}`;

        const filePromises = req.files.map(async (uploadedFile) => {
            // Log file type for debugging
            console.log('💾 Uploading file:', uploadedFile.originalname, 'MIME type:', uploadedFile.mimetype);

            const uploadResult = await uploadFile(uploadedFile, folder, true);

            return File.create({
                requestId,
                uploadedBy: req.user.id,
                uploadedByRole: req.user.role,
                fileName: uploadResult.fileName,
                originalName: uploadResult.originalName,
                fileType: req.body.fileType || 'other',
                fileCategory,
                mimeType: uploadResult.mimeType,
                fileSize: uploadResult.fileSize,
                filePath: uploadResult.url,
                thumbnailUrl: uploadResult.thumbnailUrl,
                metadata: {
                    ...uploadResult.metadata,
                    storageKey: uploadResult.storageKey,
                    storageBucket: uploadResult.storageBucket,
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
        // Clean up uploaded files (only if using local storage and files exist)
        if (config.storage.driver === 'local' && req.files) {
            req.files.forEach(file => {
                try {
                    if (file.path && fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                } catch (e) {
                    console.error('Error deleting temporary file:', e);
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

        // Increment download count
        await file.increment('downloadCount');

        // Use the unified getFileStream utility which handles local and remote (Cloudinary/S3)
        // By streaming from the backend, we avoid browser header forwarding issues (401s)
        try {
            const { getFileStream } = await import('../utils/storage.js');
            const storageKey = file.metadata?.storageKey || file.filePath;
            const streamResult = await getFileStream(storageKey, {
                resource_type: file.metadata?.resource_type
            });

            res.setHeader('Content-Type', file.mimeType || streamResult.contentType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
            if (streamResult.contentLength) {
                res.setHeader('Content-Length', streamResult.contentLength);
            }

            if (streamResult.type === 'local') {
                return res.sendFile(streamResult.path);
            } else {
                streamResult.stream.pipe(res);
                return;
            }
        } catch (err) {
            console.error('Error fetching file stream:', err);
            return res.status(500).json({
                success: false,
                error: { code: 'STREAM_ERROR', message: 'Failed to access file for download' }
            });
        }
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

        // Delete from storage if storageKey exists
        if (file.metadata && file.metadata.storageKey) {
            try {
                await deleteFromStorage(file.metadata.storageKey);
            } catch (err) {
                console.error('Error deleting from storage:', err);
            }
        }

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
    const storage = config.storage.driver === 'local'
        ? multer.diskStorage({
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
        })
        : multer.memoryStorage();

    const fileFilter = (req, file, cb) => {
        // Log the file type for debugging
        console.log('📎 Uploading file:', file.originalname, 'MIME type:', file.mimetype);

        // Temporarily allow all file types for testing
        cb(null, true);
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB per file
        }
    });
};



