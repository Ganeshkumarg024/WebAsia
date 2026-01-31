import { File, Request, User } from '../models/index.js';
import { uploadToS3, getSignedDownloadUrl, deleteFromS3 } from '../utils/s3.js';

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

        // Upload to S3
        const folder = `requests/${requestId}/${fileType}`;
        const s3Data = await uploadToS3(req.file, folder);

        // Create file record
        const file = await File.create({
            requestId,
            uploadedBy: req.user.id,
            fileName: s3Data.fileName,
            originalName: s3Data.originalName,
            fileType,
            mimeType: s3Data.mimeType,
            fileSize: s3Data.fileSize,
            s3Key: s3Data.s3Key,
            s3Bucket: s3Data.s3Bucket,
            s3Url: s3Data.s3Url,
            metadata: {
                uploadedByRole: req.user.role,
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

        // Upload all files
        const folder = `requests/${requestId}/${fileType}`;
        const uploadPromises = req.files.map(async (file) => {
            const s3Data = await uploadToS3(file, folder);

            return File.create({
                requestId,
                uploadedBy: req.user.id,
                fileName: s3Data.fileName,
                originalName: s3Data.originalName,
                fileType,
                mimeType: s3Data.mimeType,
                fileSize: s3Data.fileSize,
                s3Key: s3Data.s3Key,
                s3Bucket: s3Data.s3Bucket,
                s3Url: s3Data.s3Url,
                metadata: {
                    uploadedByRole: req.user.role,
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
            order: [['createdAt', 'DESC']]
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

        // Generate signed URL (valid for 1 hour)
        const downloadUrl = await getSignedDownloadUrl(file.s3Key, 3600);

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

        // Optionally delete from S3 (commented out for safety)
        // await deleteFromS3(file.s3Key);

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
                message: 'File deletion failed'
            }
        });
    }
};
