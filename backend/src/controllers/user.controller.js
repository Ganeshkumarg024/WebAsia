import { User } from '../models/index.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['passwordHash'] }
        });

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to get profile'
            }
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, bio, timezone, language } = req.body;

        const user = await User.findByPk(req.user.id);

        await user.update({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            phone: phone !== undefined ? phone : user.phone,
            bio: bio !== undefined ? bio : user.bio,
            timezone: timezone || user.timezone,
            language: language || user.language
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to update profile'
            }
        });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'No file uploaded'
                }
            });
        }

        const { uploadFile } = await import('../utils/storage.js');
        const result = await uploadFile(req.file, 'avatars', true);

        const user = await User.findByPk(req.user.id);
        await user.update({
            photoUrl: result.url
        });

        res.json({
            success: true,
            message: 'Avatar updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to upload avatar'
            }
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id);

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Current password is incorrect'
                }
            });
        }

        // Update password
        await user.update({ passwordHash: newPassword });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to change password'
            }
        });
    }
};
