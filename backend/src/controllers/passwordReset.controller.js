import { User } from '../models/index.js';
import { Op } from 'sequelize';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendEmailVerification } from '../utils/email.js';

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Don't reveal if user exists
            return res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save token to user
        await user.update({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpiry: resetTokenExpiry
        });

        // Send email
        try {
            await sendPasswordResetEmail(user, resetToken);
        } catch (emailError) {
            console.error('Email send error:', emailError);
            // Continue even if email fails
        }

        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent'
        });
    } catch (error) {
        console.error('Request password reset error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to process password reset request'
            }
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Hash the token to compare
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            where: {
                resetPasswordToken: resetTokenHash,
                resetPasswordExpiry: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired reset token'
                }
            });
        }

        // Update password
        user.password = newPassword; // Will be hashed by model hook
        user.resetPasswordToken = null;
        user.resetPasswordExpiry = null;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to reset password'
            }
        });
    }
};

export const sendVerificationEmail = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_VERIFIED',
                    message: 'Email already verified'
                }
            });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
        const verificationTokenExpiry = new Date(Date.now() + 86400000); // 24 hours

        await user.update({
            emailVerificationToken: verificationTokenHash,
            emailVerificationExpiry: verificationTokenExpiry
        });

        // Send email
        try {
            await sendEmailVerification(user, verificationToken);
        } catch (emailError) {
            console.error('Email send error:', emailError);
        }

        res.json({
            success: true,
            message: 'Verification email sent'
        });
    } catch (error) {
        console.error('Send verification email error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to send verification email'
            }
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        // Hash the token
        const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            where: {
                emailVerificationToken: verificationTokenHash,
                emailVerificationExpiry: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired verification token'
                }
            });
        }

        // Mark email as verified
        await user.update({
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpiry: null
        });

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to verify email'
            }
        });
    }
};
