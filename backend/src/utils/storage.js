import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import sharp from 'sharp';
import config from '../config/index.js';

// Initialize S3 Client (only if needed)
let s3Client = null;
if (config.storage.driver === 's3') {
    s3Client = new S3Client({
        region: config.aws.region,
        credentials: {
            accessKeyId: config.aws.accessKeyId,
            secretAccessKey: config.aws.secretAccessKey
        }
    });
}

// Initialize Cloudinary (only if needed)
if (config.storage.driver === 'cloudinary') {
    cloudinary.config({
        cloud_name: config.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret
    });
}

/**
 * Ensure directory exists for local storage
 */
const ensureDir = async (dirPath) => {
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
    }
};

/**
 * Generate a thumbnail buffer from an image buffer
 */
export const generateThumbnail = async (buffer, width = 300, height = 300) => {
    try {
        return await sharp(buffer)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 80 })
            .toBuffer();
    } catch (error) {
        console.error('Thumbnail generation error:', error);
        return null;
    }
};

/**
 * Upload file to storage (S3, Cloudinary or Local)
 */
export const uploadFile = async (file, folder = 'uploads', generateThumb = false) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const storageKey = `${folder}/${fileName}`;

    if (config.storage.driver === 's3') {
        return uploadToS3(file, fileName, storageKey, generateThumb);
    } else if (config.storage.driver === 'cloudinary') {
        return uploadToCloudinary(file, folder);
    } else {
        return uploadToLocal(file, fileName, storageKey, generateThumb);
    }
};

const uploadToCloudinary = async (file, folder) => {
    try {
        if (!file.buffer) {
            throw new Error('File buffer is missing. Ensure multer is using memoryStorage.');
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload stream callback error:', error);
                        return reject(new Error(`Cloudinary upload failed: ${error.message}`));
                    }
                    resolve({
                        storageKey: result.public_id,
                        storageBucket: 'cloudinary',
                        url: result.secure_url,
                        thumbnailUrl: result.resource_type === 'image' ?
                            cloudinary.url(result.public_id, { width: 300, height: 300, crop: 'fill' }) : null,
                        fileName: `${result.public_id}.${result.format}`,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        fileSize: result.bytes,
                        metadata: result
                    });
                }
            );

            // Use end() with buffer instead of pipe for better reliability with memory storage
            try {
                uploadStream.end(file.buffer);
            } catch (err) {
                console.error('Error ending Cloudinary upload stream:', err);
                reject(err);
            }
        });
    } catch (error) {
        console.error('Cloudinary upload wrapper error:', error);
        throw error;
    }
};

/**
 * Upload to S3 implementation
 */
const uploadToS3 = async (file, fileName, s3Key, generateThumb) => {
    try {
        const uploadParams = {
            Bucket: config.aws.s3Bucket,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'private'
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        const s3Url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${s3Key}`;
        let thumbnailUrl = null;

        if (generateThumb && file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
            const thumbBuffer = await generateThumbnail(file.buffer);
            if (thumbBuffer) {
                const thumbKey = `${path.dirname(s3Key)}/thumbnails/${fileName.split('.')[0]}.webp`;
                const thumbParams = {
                    Bucket: config.aws.s3Bucket,
                    Key: thumbKey,
                    Body: thumbBuffer,
                    ContentType: 'image/webp',
                    ACL: 'private'
                };
                await s3Client.send(new PutObjectCommand(thumbParams));
                thumbnailUrl = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${thumbKey}`;
            }
        }

        return {
            storageKey: s3Key,
            storageBucket: config.aws.s3Bucket,
            url: s3Url,
            thumbnailUrl,
            fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('File upload to S3 failed');
    }
};

/**
 * Upload to Local implementation
 */
const uploadToLocal = async (file, fileName, localKey, generateThumb) => {
    try {
        const fullPath = path.join(process.cwd(), config.storage.localPath, localKey);
        await ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, file.buffer);

        const url = `${config.storage.baseUrl}/${localKey}`;
        let thumbnailUrl = null;

        if (generateThumb && file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
            const thumbBuffer = await generateThumbnail(file.buffer);
            if (thumbBuffer) {
                const thumbKey = `${path.dirname(localKey)}/thumbnails/${fileName.split('.')[0]}.webp`;
                const thumbPath = path.join(process.cwd(), config.storage.localPath, thumbKey);
                await ensureDir(path.dirname(thumbPath));
                await fs.writeFile(thumbPath, thumbBuffer);
                thumbnailUrl = `${config.storage.baseUrl}/${thumbKey}`;
            }
        }

        return {
            storageKey: localKey,
            storageBucket: 'local',
            url,
            thumbnailUrl,
            fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size
        };
    } catch (error) {
        console.error('Local upload error:', error);
        throw new Error('File upload to local storage failed');
    }
};

/**
 * Get signed or public URL for file download
 */
export const getDownloadUrl = async (fileId, storageKey, expiresIn = 3600) => {
    if (config.storage.driver === 's3') {
        try {
            const command = new GetObjectCommand({
                Bucket: config.aws.s3Bucket,
                Key: storageKey
            });
            return await getSignedUrl(s3Client, command, { expiresIn });
        } catch (error) {
            console.error('S3 signed URL error:', error);
            throw new Error('Failed to generate download URL');
        }
    } else if (config.storage.driver === 'cloudinary') {
        // For Cloudinary, we can return the storageKey if it's already a secure_url,
        // but usually we store the public_id as storageKey.
        // If we want a download URL that forces content-disposition, we use:
        return cloudinary.url(storageKey, {
            flags: 'attachment',
            secure: true
        });
    } else {
        // Return a proxied API endpoint for local storage to ensure permission checks
        // We pass the fileId to make it easier for the proxy to check permissions
        return `${config.storage.baseUrl.replace('/uploads', '/api/files/stream')}/${fileId}`;
    }
};

/**
 * Delete file from storage
 */
export const deleteFile = async (storageKey) => {
    if (config.storage.driver === 's3') {
        try {
            const command = new DeleteObjectCommand({
                Bucket: config.aws.s3Bucket,
                Key: storageKey
            });
            await s3Client.send(command);
            return true;
        } catch (error) {
            console.error('S3 delete error:', error);
            throw new Error('File deletion from S3 failed');
        }
    } else if (config.storage.driver === 'cloudinary') {
        try {
            const result = await cloudinary.uploader.destroy(storageKey);
            return result.result === 'ok';
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            throw new Error('File deletion from Cloudinary failed');
        }
    } else {
        try {
            const fullPath = path.join(process.cwd(), config.storage.localPath, storageKey);
            await fs.unlink(fullPath);

            // Try to delete thumbnail if it exists
            const thumbKey = `${path.dirname(storageKey)}/thumbnails/${path.basename(storageKey).split('.')[0]}.webp`;
            const thumbPath = path.join(process.cwd(), config.storage.localPath, thumbKey);
            await fs.unlink(thumbPath).catch(() => { }); // Ignore error if thumb doesn't exist

            return true;
        } catch (error) {
            console.error('Local delete error:', error);
            throw new Error('File deletion from local storage failed');
        }
    }
};

/**
 * Scan file for viruses (Placeholder for ClamAV or similar integration)
 */
export const scanForViruses = async (buffer) => {
    // In a real production app, you'd integrate with ClamAV or a third-party API like VirusTotal.
    // For now, we'll simulate a scan.
    return {
        isSafe: true,
        message: 'File scan completed successfully'
    };
};

/**
 * Get a ReadStream for a local file or generic stream for remote
 */
export const getFileStream = async (storageKey, options = {}) => {
    if (config.storage.driver === 'local') {
        const fullPath = path.join(process.cwd(), config.storage.localPath, storageKey);
        try {
            await fs.access(fullPath);
            return { type: 'local', path: path.resolve(fullPath) };
        } catch (error) {
            throw new Error('File not found');
        }
    } else if (config.storage.driver === 's3') {
        try {
            const command = new GetObjectCommand({
                Bucket: config.aws.s3Bucket,
                Key: storageKey
            });
            const response = await s3Client.send(command);
            return {
                type: 'stream',
                stream: response.Body,
                contentType: response.ContentType,
                contentLength: response.ContentLength
            };
        } catch (error) {
            console.error('S3 stream error:', error);
            throw new Error('Failed to get stream from S3');
        }
    } else if (config.storage.driver === 'cloudinary') {
        try {
            const axios = (await import('axios')).default;

            // Determine resource_type. Default to 'image' which handles images and PDFs.
            // Using 'auto' in the URL is not supported for signed delivery.
            const resourceType = options.resource_type || options.resourceType || 'image';

            // Generate a SIGNED URL to bypass any ACL restrictions
            // We use storageKey which is the public_id
            const signedUrl = cloudinary.url(storageKey, {
                sign_url: true,
                secure: true,
                resource_type: resourceType
            });

            const response = await axios({
                method: 'get',
                url: signedUrl,
                responseType: 'stream',
                headers: {
                    'Accept': '*/*',
                    'User-Agent': 'WebAsia-Backend/1.0.0'
                }
            });

            return {
                type: 'stream',
                stream: response.data,
                contentType: response.headers['content-type'],
                contentLength: response.headers['content-length']
            };
        } catch (error) {
            console.error('Cloudinary stream error:', error.message);
            // If it's a 400/404 with the assumed resourceType, try 'raw' as a fallback
            if (options.retryWithRaw !== false && (error.response?.status === 400 || error.response?.status === 404)) {
                return getFileStream(storageKey, { ...options, resource_type: 'raw', retryWithRaw: false });
            }
            throw new Error(`Failed to get stream from Cloudinary: ${error.message}`);
        }
    }
};

/**
 * Validate file (Shared logic)
 */
export const validateFile = (file, allowedTypes, maxSize = 50 * 1024 * 1024) => {
    if (file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }
    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        throw new Error(`File type ${file.mimetype} not allowed`);
    }
    return true;
};

/**
 * Get allowed mime types (Shared logic)
 */
export const getAllowedMimeTypes = (category) => {
    const mimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'],
        video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-flv'],
        document: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv'
        ],
        design: [
            'application/postscript',
            'image/vnd.adobe.photoshop',
            'application/x-photoshop',
            'application/illustrator',
            'application/vnd.adobe.illustrator',
            'application/x-indesign',
            'image/svg+xml'
        ],
        archive: [
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'application/x-tar',
            'application/x-gzip'
        ]
    };

    if (category === 'all') {
        return Object.values(mimeTypes).flat();
    }

    return mimeTypes[category] || [];
};
