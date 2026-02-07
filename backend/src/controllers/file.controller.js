import { File, Request, User } from '../models/index.js';
import { uploadFile as storageUploadFile, getDownloadUrl, deleteFile as deleteFromStorage, getFileStream, scanForViruses } from '../utils/storage.js';
import path from 'path';
import fs from 'fs';

export const uploadFile = async (req, res) => {
    try {
        const { requestId, fileType = 'other' } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_FILE',
                    message: 'No file provided'
                }
            });
        }

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

        // Virus Scan
        const scanResults = await scanForViruses(req.file.buffer);
        if (!scanResults.isSafe) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MALICIOUS_FILE',
                    message: scanResults.message
                }
            });
        }

        // Upload to Storage
        const folder = `requests/${requestId}/${fileType}`;
        const storageData = await storageUploadFile(req.file, folder, true); // true for generateThumb

        // Create file record
        const file = await File.create({
            requestId,
            uploadedBy: req.user.id,
            uploadedByRole: req.user.role,
            fileName: storageData.fileName,
            originalName: storageData.originalName,
            fileType,
            mimeType: storageData.mimeType,
            fileSize: storageData.fileSize,
            filePath: storageData.url, // Store the URL directly in filePath for easier frontend access
            thumbnailUrl: storageData.thumbnailUrl,
            metadata: {
                ...storageData.metadata,
                storageKey: storageData.storageKey,
                storageBucket: storageData.storageBucket,
                uploadedAt: new Date()
            }
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: file
        });
    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'File upload failed'
            }
        });
    }
};

export const uploadMultipleFiles = async (req, res) => {
    try {
        const { requestId, fileType = 'other' } = req.body;

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

        // Virus Scan and Upload all files
        const folder = `requests/${requestId}/${fileType}`;
        const uploadPromises = req.files.map(async (file) => {
            // Scan
            const scanResults = await scanForViruses(file.buffer);
            if (!scanResults.isSafe) throw new Error(`File ${file.originalname} failed virus scan`);

            const storageData = await storageUploadFile(file, folder, true);

            return File.create({
                requestId,
                uploadedBy: req.user.id,
                uploadedByRole: req.user.role,
                fileName: storageData.fileName,
                originalName: storageData.originalName,
                fileType,
                mimeType: storageData.mimeType,
                fileSize: storageData.fileSize,
                filePath: storageData.url,
                thumbnailUrl: storageData.thumbnailUrl,
                metadata: {
                    ...storageData.metadata,
                    storageKey: storageData.storageKey,
                    storageBucket: storageData.storageBucket,
                    uploadedAt: new Date()
                }
            });
        });

        const files = await Promise.all(uploadPromises);

        res.status(201).json({
            success: true,
            message: `${files.length} files uploaded successfully`,
            data: files
        });
    } catch (error) {
        console.error('Upload multiple files error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'File upload failed'
            }
        });
    }
};

export const getRequestFiles = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { fileType } = req.query;

        const where = { requestId, isActive: true };
        if (fileType) {
            where.fileType = fileType;
        }

        const files = await File.findAll({
            where,
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'firstName', 'lastName', 'role'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: files
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

export const getFileDownloadUrl = async (req, res) => {
    try {
        const { id } = req.params;

        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'FILE_NOT_FOUND',
                    message: 'File not found'
                }
            });
        }

        // Generate signed URL (valid for 1 hour) or return secure streaming URL
        const storageKey = file.metadata?.storageKey || file.filePath;

        // If it's a remote URL, we might want to return a direct URL for 
        // non-AJAX downloads, but to be consistent and avoid 401s in AJAX,
        // we'll encourage using the stream route if headers are an issue.
        // For now, return the direct URL but log a warning.
        const downloadUrl = await getDownloadUrl(file.id, storageKey, 3600);

        // Increment download count
        await file.increment('downloadCount');

        res.json({
            success: true,
            data: {
                downloadUrl,
                fileName: file.originalName,
                expiresIn: 3600
            }
        });
    } catch (error) {
        console.error('Get download URL error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to generate download URL'
            }
        });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;

        const file = await File.findByPk(id, {
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

        res.json({
            success: true,
            message: 'File de-activated successfully'
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
 * Stream a local file securely after checking permissions
 */
export const streamFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findByPk(id, {
            include: [{ model: Request, as: 'request' }]
        });

        if (!file) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'File not found' }
            });
        }

        // Permission check
        const isOwner = file.uploadedBy === req.user.id;
        const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);
        const isAssignedDesigner = file.request && file.request.assignedDesignerId === req.user.id;
        const isClient = file.request && file.request.clientId === req.user.id;

        if (!isOwner && !isAdminOrManager && !isAssignedDesigner && !isClient) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Access denied' }
            });
        }

        const { getFileStream } = await import('../utils/storage.js');
        const storageKey = file.metadata?.storageKey || file.filePath;
        const streamResult = await getFileStream(storageKey, {
            resource_type: file.metadata?.resource_type
        });

        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimeType || streamResult.contentType || 'application/octet-stream');
        if (streamResult.contentLength) {
            res.setHeader('Content-Length', streamResult.contentLength);
        }

        if (streamResult.type === 'local') {
            return res.sendFile(streamResult.path);
        } else {
            streamResult.stream.pipe(res);
            return;
        }
    } catch (error) {
        console.error('Stream file error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Streaming failed' }
        });
    }
};

export const getFiles = async (req, res) => {
    try {
        const { fileType, category } = req.query;
        const where = {};

        // If not admin, only show files related to user
        if (req.user.role !== 'admin') {
            where.uploadedBy = req.user.id;
        }

        if (fileType) where.fileType = fileType;

        const files = await File.findAll({
            where,
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'firstName', 'lastName'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: files
        });
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch files'
            }
        });
    }
};
