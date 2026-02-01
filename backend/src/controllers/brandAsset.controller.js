import { BrandAsset, File } from '../models/index.js';
import { uploadFile, deleteFile } from '../utils/storage.js';

export const getBrandAssets = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.query;

        const where = { userId, isActive: true };
        if (type) {
            where.type = type;
        }

        const assets = await BrandAsset.findAll({
            where,
            include: [{ model: File, as: 'file' }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: assets
        });
    } catch (error) {
        console.error('Get brand assets error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch brand assets'
            }
        });
    }
};

export const createBrandAsset = async (req, res) => {
    try {
        const { name, description, type, value } = req.body;
        const userId = req.user.id;

        let fileId = null;

        // If a file is uploaded, handle it
        if (req.file) {
            const folder = `brand-assets/${userId}`;
            const storageData = await uploadFile(req.file, folder, true); // generateThumb=true

            const file = await File.create({
                uploadedBy: userId,
                fileName: storageData.fileName,
                originalName: storageData.originalName,
                fileType: 'other', // Or add 'brand_asset' to ENUM later
                mimeType: storageData.mimeType,
                fileSize: storageData.fileSize,
                s3Key: storageData.storageKey,
                s3Bucket: storageData.storageBucket || 'local',
                s3Url: storageData.url,
                thumbnailUrl: storageData.thumbnailUrl
            });
            fileId = file.id;
        }

        const asset = await BrandAsset.create({
            userId,
            name,
            description,
            type,
            value: value ? (typeof value === 'string' ? JSON.parse(value) : value) : {},
            fileId,
            isActive: true
        });

        const fullAsset = await BrandAsset.findByPk(asset.id, {
            include: [{ model: File, as: 'file' }]
        });

        res.status(201).json({
            success: true,
            message: 'Brand asset created successfully',
            data: fullAsset
        });
    } catch (error) {
        console.error('Create brand asset error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to create brand asset'
            }
        });
    }
};

export const updateBrandAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type, value, isActive } = req.body;
        const userId = req.user.id;

        const asset = await BrandAsset.findOne({
            where: { id, userId }
        });

        if (!asset) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Brand asset not found'
                }
            });
        }

        await asset.update({
            name: name !== undefined ? name : asset.name,
            description: description !== undefined ? description : asset.description,
            type: type !== undefined ? type : asset.type,
            value: value !== undefined ? (typeof value === 'string' ? JSON.parse(value) : value) : asset.value,
            isActive: isActive !== undefined ? isActive : asset.isActive
        });

        const updatedAsset = await BrandAsset.findByPk(id, {
            include: [{ model: File, as: 'file' }]
        });

        res.json({
            success: true,
            message: 'Brand asset updated successfully',
            data: updatedAsset
        });
    } catch (error) {
        console.error('Update brand asset error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to update brand asset'
            }
        });
    }
};

export const deleteBrandAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const asset = await BrandAsset.findOne({
            where: { id, userId }
        });

        if (!asset) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Brand asset not found'
                }
            });
        }

        // Soft delete
        await asset.update({ isActive: false });

        res.json({
            success: true,
            message: 'Brand asset deleted successfully'
        });
    } catch (error) {
        console.error('Delete brand asset error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to delete brand asset'
            }
        });
    }
};
