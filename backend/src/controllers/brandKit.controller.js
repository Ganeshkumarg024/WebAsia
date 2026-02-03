import BrandKit from '../models/BrandKit.js';
import { User } from '../models/index.js';
import path from 'path';
import fs from 'fs/promises';
import archiver from 'archiver';

// Get user's brand kit
export const getBrandKit = async (req, res) => {
    try {
        const userId = req.user.id;

        let brandKit = await BrandKit.findOne({ where: { userId } });

        // Create default brand kit if doesn't exist
        if (!brandKit) {
            brandKit = await BrandKit.create({
                userId,
                colors: ['#2563EB', '#10B981', '#1E293B']
            });
        }

        res.json({
            success: true,
            data: brandKit
        });
    } catch (error) {
        console.error('Get brand kit error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch brand kit' }
        });
    }
};

// Update brand kit
export const updateBrandKit = async (req, res) => {
    try {
        const userId = req.user.id;
        const { primaryColor, secondaryColor, accentColor, colors, fonts } = req.body;

        let brandKit = await BrandKit.findOne({ where: { userId } });

        if (!brandKit) {
            brandKit = await BrandKit.create({
                userId,
                primaryColor,
                secondaryColor,
                accentColor,
                colors,
                fonts
            });
        } else {
            await brandKit.update({
                primaryColor,
                secondaryColor,
                accentColor,
                colors,
                fonts
            });
        }

        res.json({
            success: true,
            message: 'Brand kit updated successfully',
            data: brandKit
        });
    } catch (error) {
        console.error('Update brand kit error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to update brand kit' }
        });
    }
};

// Upload logo
export const uploadLogo = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: { message: 'No file uploaded' }
            });
        }

        // Construct logo URL (assuming uploads are served statically)
        const logoUrl = `/uploads/brand-kits/${req.file.filename}`;

        let brandKit = await BrandKit.findOne({ where: { userId } });

        if (!brandKit) {
            brandKit = await BrandKit.create({
                userId,
                logoUrl,
                colors: ['#2563EB', '#10B981', '#1E293B']
            });
        } else {
            // Delete old logo file if exists
            if (brandKit.logoUrl) {
                const oldFilePath = path.join(process.cwd(), 'uploads', 'brand-kits', path.basename(brandKit.logoUrl));
                try {
                    await fs.unlink(oldFilePath);
                } catch (err) {
                    console.error('Error deleting old logo:', err);
                }
            }

            await brandKit.update({ logoUrl });
        }

        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            data: brandKit
        });
    } catch (error) {
        console.error('Upload logo error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to upload logo' }
        });
    }
};

// Download brand assets as ZIP
export const downloadAssets = async (req, res) => {
    try {
        const userId = req.user.id;

        const brandKit = await BrandKit.findOne({ where: { userId } });

        if (!brandKit) {
            return res.status(404).json({
                success: false,
                error: { message: 'Brand kit not found' }
            });
        }

        // Create a ZIP archive
        const archive = archiver('zip', { zlib: { level: 9 } });

        res.attachment('brand-kit.zip');
        archive.pipe(res);

        // Add logo if exists
        if (brandKit.logoUrl) {
            const logoPath = path.join(process.cwd(), 'uploads', 'brand-kits', path.basename(brandKit.logoUrl));
            try {
                await fs.access(logoPath);
                archive.file(logoPath, { name: `logo${path.extname(logoPath)}` });
            } catch (err) {
                console.error('Logo file not found:', err);
            }
        }

        // Create a color palette text file
        const colorPalette = `Brand Color Palette
=====================

Primary Color: ${brandKit.primaryColor}
Secondary Color: ${brandKit.secondaryColor}
Accent Color: ${brandKit.accentColor}

All Colors:
${brandKit.colors.map((color, i) => `${i + 1}. ${color}`).join('\n')}
`;

        archive.append(colorPalette, { name: 'colors.txt' });

        // Create HTML color swatches
        const colorSwatchesHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Brand Colors</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .swatch { display: inline-block; width: 100px; height: 100px; margin: 10px; border-radius: 8px; }
        .label { text-align: center; margin-top: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Brand Color Palette</h1>
    ${brandKit.colors.map(color => `
        <div style="display: inline-block; margin: 10px;">
            <div class="swatch" style="background-color: ${color};"></div>
            <div class="label">${color}</div>
        </div>
    `).join('')}
</body>
</html>
`;

        archive.append(colorSwatchesHtml, { name: 'colors.html' });

        await archive.finalize();
    } catch (error) {
        console.error('Download assets error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to download assets' }
        });
    }
};
