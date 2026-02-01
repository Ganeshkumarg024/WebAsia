import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
 * Upload file to storage (S3 or Local)
 */
export const uploadFile = async (file, folder = 'uploads', generateThumb = false) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const storageKey = `${folder}/${fileName}`;

    if (config.storage.driver === 's3') {
        return uploadToS3(file, fileName, storageKey, generateThumb);
    } else {
        return uploadToLocal(file, fileName, storageKey, generateThumb);
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
 * Get a ReadStream for a local file
 */
export const getFileStream = async (storageKey) => {
    if (config.storage.driver !== 'local') {
        throw new Error('getFileStream only supported for local storage');
    }

    const fullPath = path.join(process.cwd(), config.storage.localPath, storageKey);
    try {
        await fs.access(fullPath);
        return path.resolve(fullPath); // Return path for createReadStream in controller
    } catch (error) {
        throw new Error('File not found');
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
