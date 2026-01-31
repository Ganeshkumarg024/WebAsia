import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config/index.js';
import crypto from 'crypto';
import path from 'path';

// Initialize S3 Client
const s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
    }
});

export const uploadToS3 = async (file, folder = 'uploads') => {
    try {
        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const s3Key = `${folder}/${fileName}`;

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

        return {
            s3Key,
            s3Bucket: config.aws.s3Bucket,
            s3Url,
            fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('File upload failed');
    }
};

export const getSignedDownloadUrl = async (s3Key, expiresIn = 3600) => {
    try {
        const command = new GetObjectCommand({
            Bucket: config.aws.s3Bucket,
            Key: s3Key
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return signedUrl;
    } catch (error) {
        console.error('S3 signed URL error:', error);
        throw new Error('Failed to generate download URL');
    }
};

export const deleteFromS3 = async (s3Key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: config.aws.s3Bucket,
            Key: s3Key
        });

        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error('S3 delete error:', error);
        throw new Error('File deletion failed');
    }
};

export const validateFile = (file, allowedTypes, maxSize = 50 * 1024 * 1024) => {
    // Check file size (default 50MB)
    if (file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        throw new Error(`File type ${file.mimetype} not allowed`);
    }

    return true;
};

export const getAllowedMimeTypes = (category) => {
    const mimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        design: ['application/postscript', 'image/vnd.adobe.photoshop', 'application/illustrator'],
        archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
    };

    if (category === 'all') {
        return Object.values(mimeTypes).flat();
    }

    return mimeTypes[category] || [];
};
