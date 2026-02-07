import { User } from '../models/index.js';
import { generateTokenPair } from '../utils/jwt.js';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { sendOtpEmail } from '../utils/email.js';
import { Op } from 'sequelize';

export const register = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const { email, password, firstName, lastName, phone, role = 'client', referralCode } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: 'Email already registered'
                }
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

        // Create user
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            phone,
            role,
            status: 'inactive', // Changed to inactive until verified
            emailVerificationToken: otpHash,
            emailVerificationExpiry: otpExpiry
        });

        // 3. Handle Affiliate Referral
        if (referralCode) {
            try {
                const { affiliateService } = await import('../services/affiliate.service.js');
                await affiliateService.assignReferral(user.id, referralCode);
            } catch (err) {
                console.error('Failed to assign referral:', err);
            }
        }

        // Send verification email
        try {
            await sendOtpEmail(user, otp);
        } catch (emailError) {
            console.error('Email send error:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email with the OTP sent.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified
                }
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Registration failed'
            }
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email and OTP are required'
                }
            });
        }

        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            where: {
                email,
                emailVerificationToken: otpHash,
                emailVerificationExpiry: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_OTP',
                    message: 'Invalid or expired OTP'
                }
            });
        }

        // Activate user
        await user.update({
            emailVerified: true,
            status: 'active',
            emailVerificationToken: null,
            emailVerificationExpiry: null
        });

        // Generate tokens for immediate login
        const tokens = generateTokenPair(user);

        res.json({
            success: true,
            message: 'Email verified successfully',
            data: {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified
                }
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Verification failed'
            }
        });
    }
};

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email is required'
                }
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_VERIFIED',
                    message: 'Email is already verified'
                }
            });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

        await user.update({
            emailVerificationToken: otpHash,
            emailVerificationExpiry: otpExpiry
        });

        // Send email
        try {
            await sendOtpEmail(user, otp);
        } catch (emailError) {
            console.error('Email resend error:', emailError);
        }

        res.json({
            success: true,
            message: 'Verification code resent successfully'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to resend OTP'
            }
        });
    }
};

export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid email or password'
                }
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid email or password'
                }
            });
        }

        // Check email verification
        if (!user.emailVerified) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNVERIFIED',
                    message: 'Please verify your email to login'
                }
            });
        }

        // Check account status
        if (user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Account has been suspended'
                }
            });
        }

        if (user.status === 'deleted') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Account has been deleted'
                }
            });
        }

        // Update last login
        await user.update({ lastLoginAt: new Date() });

        // Generate tokens
        const tokens = generateTokenPair(user);

        res.json({
            success: true,
            data: {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    photoUrl: user.photoUrl,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Login failed'
            }
        });
    }
};

export const logout = async (req, res) => {
    try {
        // TODO: Invalidate refresh token in Redis

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Logout failed'
            }
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Refresh token is required'
                }
            });
        }

        // Verify refresh token
        const { verifyRefreshToken } = await import('../utils/jwt.js');
        const decoded = verifyRefreshToken(refreshToken);

        // Get user
        const user = await User.findByPk(decoded.id);
        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid refresh token'
                }
            });
        }

        // Generate new access token
        const { generateAccessToken } = await import('../utils/jwt.js');
        const accessToken = generateAccessToken(user);

        res.json({
            success: true,
            data: {
                accessToken
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Invalid or expired refresh token'
            }
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'refreshToken'] }
        });

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to get user data'
            }
        });
    }
};
