import { User, Subscription, Request, SubscriptionPlan } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
    try {
        const { role, status, search, limit = 50, offset = 0 } = req.query;

        const where = {};

        if (role) {
            where.role = role;
        }

        if (status) {
            where.status = status;
        }

        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where,
            attributes: { exclude: ['password', 'refreshToken'] },
            include: [
                { model: Subscription, as: 'subscriptions', include: [{ model: SubscriptionPlan, as: 'plan' }] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const totalCount = await User.count({ where });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch users'
            }
        });
    }
};

export const createUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'USER_EXISTS',
                    message: 'User with this email already exists'
                }
            });
        }

        // Create user
        const user = await User.create({
            email,
            password, // Will be hashed by model hook
            firstName,
            lastName,
            role,
            phone,
            status: 'active'
        });

        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to create user'
            }
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        // Don't allow password update through this endpoint
        delete updates.password;
        delete updates.refreshToken;

        await user.update(updates);

        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.json({
            success: true,
            message: 'User updated successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to update user'
            }
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        // Soft delete
        await user.update({ status: 'inactive' });

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to delete user'
            }
        });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalUsers,
            activeUsers,
            totalRequests,
            activeRequests,
            completedRequests,
            totalRevenue,
            activeSubscriptions
        ] = await Promise.all([
            User.count(),
            User.count({ where: { status: 'active' } }),
            Request.count(),
            Request.count({ where: { status: { [Op.in]: ['active', 'assigned', 'in_progress'] } } }),
            Request.count({ where: { status: 'completed' } }),
            Subscription.sum('amount', { where: { status: 'active' } }),
            Subscription.count({ where: { status: 'active' } })
        ]);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers
                },
                requests: {
                    total: totalRequests,
                    active: activeRequests,
                    completed: completedRequests
                },
                revenue: {
                    total: totalRevenue || 0,
                    activeSubscriptions
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch dashboard stats'
            }
        });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }

        const [
            newUsers,
            newRequests,
            completedRequests,
            newSubscriptions
        ] = await Promise.all([
            User.count({ where: { createdAt: { [Op.gte]: startDate } } }),
            Request.count({ where: { createdAt: { [Op.gte]: startDate } } }),
            Request.count({
                where: {
                    status: 'completed',
                    completedAt: { [Op.gte]: startDate }
                }
            }),
            Subscription.count({ where: { createdAt: { [Op.gte]: startDate } } })
        ]);

        res.json({
            success: true,
            data: {
                period,
                startDate,
                endDate,
                metrics: {
                    newUsers,
                    newRequests,
                    completedRequests,
                    newSubscriptions
                }
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch analytics'
            }
        });
    }
};
