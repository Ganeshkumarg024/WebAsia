import { Op, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';
import { User, Subscription, Request, SubscriptionPlan, Message, Payment, Testimonial, Affiliate, FinancialLog, Referral, Commission, Payout, AffiliateResource, SystemLog } from '../models/index.js';
import { affiliateService } from '../services/affiliate.service.js';
import { sendAdminPasswordResetEmail } from '../utils/email.js';

// ... (existing code)

// Affiliate Management
export const getAllAffiliates = async (req, res) => {
    try {
        const { status, search, limit = 50, offset = 0 } = req.query;
        const where = {};
        if (status) where.status = status;

        const affiliates = await Affiliate.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, data: affiliates });
    } catch (error) {
        console.error('Get all affiliates error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch affiliates' } });
    }
};

export const updateAffiliateCommission = async (req, res) => {
    try {
        const { id } = req.params;
        const { commissionRate } = req.body;

        const affiliate = await Affiliate.findByPk(id);
        if (!affiliate) return res.status(404).json({ success: false, error: { message: 'Affiliate not found' } });

        await affiliate.update({ commissionRate });

        res.json({ success: true, message: 'Commission rate updated successfully', data: affiliate });
    } catch (error) {
        console.error('Update commission error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to update commission rate' } });
    }
};

export const approvePayout = async (req, res) => {
    try {
        const { id } = req.params; // This is the FinancialLog ID
        const { status, transactionId, adminNotes } = req.body; // status: 'completed' or 'cancelled'

        const log = await FinancialLog.findByPk(id);
        if (!log || log.type !== 'payout') {
            return res.status(404).json({ success: false, error: { message: 'Payout request not found' } });
        }

        const t = await FinancialLog.sequelize.transaction();
        try {
            await log.update({
                status: status || 'completed',
                metadata: { ...log.metadata, transactionId, adminNotes },
                completedAt: status === 'completed' ? new Date() : null
            }, { transaction: t });

            if (status === 'completed') {
                const affiliate = await Affiliate.findOne({ where: { userId: log.userId }, transaction: t });
                if (affiliate) {
                    await affiliate.decrement('pendingEarnings', { by: log.amount, transaction: t });
                    await affiliate.increment('paidEarnings', { by: log.amount, transaction: t });
                }
            }

            await t.commit();
            res.json({ success: true, message: `Payout ${status} successfully` });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Approve payout error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to process payout' } });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const { role, status, search, limit = 50, offset = 0 } = req.query;

        const where = {};

        if (role) {
            where.role = role;
        }

        if (status && status !== 'needs_attention') {
            where.status = status;
        }

        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        let include = [
            { model: Subscription, as: 'subscriptions', include: [{ model: SubscriptionPlan, as: 'plan' }] }
        ];

        // Specific handling for "Needs Attention" (Non-Subscribed Clients)
        if (status === 'needs_attention') {
            where.role = 'client';
            // Find users who DON'T have any subscription with status = 'active'
            where.id = {
                [Op.notIn]: User.sequelize.literal(`(
                    SELECT user_id FROM subscriptions WHERE status = 'active'
                )`)
            };
        }

        const users = await User.findAll({
            where,
            attributes: { exclude: ['password', 'refreshToken'] },
            include,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
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

        // Create user (admin-created users skip email verification)
        const user = await User.create({
            email,
            password, // Will be hashed by model hook
            firstName,
            lastName,
            role,
            phone,
            status: 'active',
            emailVerified: true
        });

        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.refreshToken;

        // If role is affiliate, auto-create Affiliate record
        if (role === 'affiliate') {
            try {
                await affiliateService.registerAffiliate(user.id);
                // Auto-approve since admin created the user
                const affiliate = await Affiliate.findOne({ where: { userId: user.id } });
                if (affiliate) {
                    await affiliate.update({
                        status: 'active',
                        approvedAt: new Date(),
                        approvedBy: req.user.id
                    });
                }
            } catch (affErr) {
                console.error('Auto-create affiliate record error:', affErr);
            }
        }

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

// Helper to calculate revenue
const calculateActiveRevenue = async () => {
    try {
        // Safety check to ensure models are loaded
        if (!Subscription || !SubscriptionPlan) return 0;

        const activeSubscriptions = await Subscription.findAll({
            where: { status: 'active' },
            include: [{ model: SubscriptionPlan, as: 'plan', attributes: ['price'] }]
        });

        return activeSubscriptions.reduce((acc, sub) => acc + (parseFloat(sub.plan?.price) || 0), 0);
    } catch (e) {
        console.error('Error calculating revenue:', e);
        return 0;
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            activeUsers,
            totalRequests,
            activeRequests,
            completedRequests,
            activeRevenue,
            activeSubscriptions,
            clientCount,
            designerCount,
            managerCount,
            affiliateCount
        ] = await Promise.all([
            User.count(),
            User.count({ where: { status: 'active' } }),
            Request.count(),
            Request.count({ where: { status: { [Op.in]: ['active', 'assigned', 'in_progress'] } } }),
            Request.count({ where: { status: 'completed' } }),
            calculateActiveRevenue(),
            Subscription.count({ where: { status: 'active' } }),
            User.count({ where: { role: 'client' } }),
            User.count({ where: { role: 'designer' } }),
            User.count({ where: { role: 'manager' } }),
            User.count({ where: { role: 'affiliate' } })
        ]);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    roles: {
                        client: clientCount || 0,
                        designer: designerCount || 0,
                        manager: managerCount || 0,
                        affiliate: affiliateCount || 0
                    }
                },
                requests: {
                    total: totalRequests,
                    active: activeRequests,
                    completed: completedRequests
                },
                revenue: {
                    total: activeRevenue || 0,
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

        // Validate startDate
        if (isNaN(startDate.getTime())) {
            startDate.setDate(new Date().getDate() - 30);
        }

        const [
            newUsers,
            newRequests,
            completedRequests,
            newSubscriptions,
            totalRevenue
        ] = await Promise.all([
            User.count({ where: { created_at: { [Op.gte]: startDate } } }),
            Request.count({ where: { created_at: { [Op.gte]: startDate } } }),
            Request.count({
                where: {
                    status: 'completed',
                    [Op.or]: [
                        { completed_at: { [Op.gte]: startDate } },
                        { updated_at: { [Op.gte]: startDate } } // Fallback
                    ]
                }
            }),
            Subscription.count({ where: { created_at: { [Op.gte]: startDate } } }),
            calculateActiveRevenue() // Total active revenue (MRR)
        ]);

        // Generate daily stats for the chart
        const dailyStats = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
            dailyStats.push({
                name: dayName,
                users: Math.floor(Math.random() * 5), // Mock data for trend
                revenue: Math.floor(Math.random() * 500)
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

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
                    newSubscriptions,
                    totalRevenue: totalRevenue || 0
                },
                dailyStats
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

// Pod Management
export const getPods = async (req, res) => {
    try {
        const managers = await User.findAll({
            where: { role: 'manager' },
            attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl'],
            include: [
                {
                    model: User,
                    as: 'designers',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl', 'status']
                }
            ]
        });

        const unassignedDesigners = await User.findAll({
            where: {
                role: 'designer',
                managerId: null
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl', 'status']
        });

        res.json({
            success: true,
            data: {
                pods: managers,
                unassignedDesigners
            }
        });
    } catch (error) {
        console.error('Get pods error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch pod data'
            }
        });
    }
};

export const assignToPod = async (req, res) => {
    try {
        const { podId, designerId } = req.body;

        const manager = await User.findOne({ where: { id: podId, role: 'manager' } });
        if (!manager) {
            return res.status(404).json({
                success: false,
                error: { code: 'MANAGER_NOT_FOUND', message: 'Manager not found' }
            });
        }

        const designer = await User.findOne({ where: { id: designerId, role: 'designer' } });
        if (!designer) {
            return res.status(404).json({
                success: false,
                error: { code: 'DESIGNER_NOT_FOUND', message: 'Designer not found' }
            });
        }

        await designer.update({ managerId: podId });

        res.json({
            success: true,
            message: 'Designer assigned to pod successfully'
        });
    } catch (error) {
        console.error('Assign to pod error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to assign designer to pod'
            }
        });
    }
};

export const removeFromPod = async (req, res) => {
    try {
        const { userId } = req.params;

        const designer = await User.findOne({ where: { id: userId, role: 'designer' } });
        if (!designer) {
            return res.status(404).json({
                success: false,
                error: { code: 'DESIGNER_NOT_FOUND', message: 'Designer not found' }
            });
        }

        await designer.update({ managerId: null });

        res.json({
            success: true,
            message: 'Designer removed from pod successfully'
        });
    } catch (error) {
        console.error('Remove from pod error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to remove designer from pod'
            }
        });
    }
};

// Communication Hub
export const getCommThreads = async (req, res) => {
    try {
        const { search, status } = req.query;

        const where = {};
        if (status === 'flagged') {
            where.isFlagged = true;
        }

        const requests = await Request.findAll({
            where,
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName'] },
                {
                    model: Message,
                    as: 'messages',
                    order: [['created_at', 'DESC']],
                    limit: 1
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get comm threads error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch communication threads'
            }
        });
    }
};

export const getCommThreadDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findByPk(id, {
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'photoUrl'] },
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName', 'photoUrl'] },
                {
                    model: Message,
                    as: 'messages',
                    include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'role'] }],
                    order: [['created_at', 'ASC']]
                }
            ]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: { code: 'REQUEST_NOT_FOUND', message: 'Request thread not found' }
            });
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Get thread details error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch thread details'
            }
        });
    }
};

export const flagCommThread = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const request = await Request.findByPk(id);
        if (!request) {
            return res.status(404).json({
                success: false,
                error: { code: 'REQUEST_NOT_FOUND', message: 'Request not found' }
            });
        }

        await request.update({
            isFlagged: true,
            flagReason: reason
        });

        res.json({
            success: true,
            message: 'Thread flagged for review successfully'
        });
    } catch (error) {
        console.error('Flag thread error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to flag thread'
            }
        });
    }
};

// Financials
export const getFinancialStats = async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        const mrr = await calculateActiveRevenue();
        const churn = await Subscription.count({ where: { status: 'cancelled' } });
        const paymentRevenue = await Payment.sum('amount', { where: { status: 'completed' } });

        const totalSubs = await Subscription.count();

        res.json({
            success: true,
            data: {
                mrr: mrr || 0,
                churnRate: totalSubs > 0 ? (churn / totalSubs * 100).toFixed(2) : 0,
                totalRevenue: paymentRevenue || 0
            }
        });
    } catch (error) {
        console.error('Get financial stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch financial stats'
            }
        });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const transactions = await Payment.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Subscription, as: 'subscription', include: [{ model: SubscriptionPlan, as: 'plan' }] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch transactions'
            }
        });
    }
};

export const getAdminRequests = async (req, res) => {
    try {
        const { status, serviceType, designerId, clientId, search, limit = 50, offset = 0 } = req.query;

        const where = {};
        if (status && status !== 'All Statuses') where.status = status;
        if (serviceType && serviceType !== 'All Services') where.serviceType = serviceType;
        if (designerId && designerId !== 'All Designers') where.assignedDesignerId = designerId;
        if (clientId && clientId !== 'All Clients') where.clientId = clientId;

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { specifications: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const requests = await Request.findAll({
            where,
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName'], include: [{ model: Subscription, as: 'subscriptions', include: [{ model: SubscriptionPlan, as: 'plan' }] }] },
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName', 'photoUrl'] },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalCount = await Request.count({ where });

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            }
        });
    } catch (error) {
        console.error('Get admin requests error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch global requests'
            }
        });
    }
};

export const adminResetUserPassword = async (req, res) => {
    try {
        const { userId, newPassword, sendEmail = false } = req.body;

        if (!userId || !newPassword) {
            return res.status(400).json({
                success: false,
                error: { message: 'User ID and new password are required' }
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { message: 'User not found' }
            });
        }

        // Update password
        await user.update({ password: newPassword }); // Will be hashed by model hook

        // Create System Log for audit trail
        await SystemLog.create({
            adminId: req.user.id,
            action: 'ADMIN_PASSWORD_RESET',
            targetType: 'user',
            targetId: userId,
            details: {
                targetEmail: user.email,
                resetBy: req.user.email
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // Send email if requested
        if (sendEmail) {
            try {
                await sendAdminPasswordResetEmail(user, newPassword);
            } catch (emailError) {
                console.error('Failed to send admin password reset email:', emailError);
            }
        }

        res.json({
            success: true,
            message: `Password for user ${user.email} has been reset successfully${sendEmail ? ' and notification email sent' : ''}`
        });
    } catch (error) {
        console.error('Admin password reset error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to reset user password'
            }
        });
    }
};

export const bulkUpdateRequests = async (req, res) => {
    try {
        const { requestIds, status, designerId, managerId } = req.body;

        if (!requestIds || !Array.isArray(requestIds)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Request IDs must be an array' }
            });
        }

        const updates = {};
        if (status) updates.status = status;
        if (designerId) {
            updates.assignedDesignerId = designerId;
            updates.assignedAt = new Date();
        }
        if (managerId) updates.assignedManagerId = managerId;

        await Request.update(updates, {
            where: { id: { [Op.in]: requestIds } }
        });

        res.json({
            success: true,
            message: `Successfully updated ${requestIds.length} requests`
        });
    } catch (error) {
        console.error('Bulk update requests error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to bulk update requests'
            }
        });
    }
};

export const getUnassignedDesigners = async (req, res) => {
    try {
        const designers = await User.findAll({
            where: {
                role: 'designer',
                managerId: null
            },
            attributes: ['id', 'firstName', 'lastName', 'photoUrl', 'role'],
            include: [{
                model: Request,
                as: 'assignedRequests',
                where: { status: { [Op.notIn]: ['completed', 'cancelled'] } },
                required: false,
                attributes: ['id']
            }]
        });

        const data = designers.map(designer => {
            const activeCount = designer.assignedRequests?.length || 0;
            return {
                ...designer.toJSON(),
                activeTasks: activeCount,
                capacity: activeCount >= 5 ? 'Full' : 'Available'
            };
        });

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get unassigned designers error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch unassigned designers'
            }
        });
    }
};

export const getRefundRequests = async (req, res) => {
    try {
        const refunds = await Payment.findAll({
            where: { status: 'refund_pending' },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: refunds
        });
    } catch (error) {
        console.error('Get refund requests error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch refund requests'
            }
        });
    }
};

export const handleRefund = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body; // action: 'approve' or 'reject'

        const payment = await Payment.findByPk(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found' }
            });
        }

        if (action === 'approve') {
            await payment.update({ status: 'refunded', notes: reason });
            // In a real app, integrate with Stripe/Razorpay refund API here
        } else {
            await payment.update({ status: 'completed', notes: `Refund rejected: ${reason}` });
        }

        res.json({
            success: true,
            message: `Refund ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });
    } catch (error) {
        console.error('Handle refund error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to process refund'
            }
        });
    }
};

export const getTestimonials = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const testimonials = await Testimonial.findAll({
            where: { status },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        console.error('Get testimonials error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch testimonials'
            }
        });
    }
};

export const approveTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Testimonial not found' }
            });
        }

        await testimonial.update({ status: 'approved', approvedBy: req.user.id });

        res.json({
            success: true,
            message: 'Testimonial approved successfully'
        });
    } catch (error) {
        console.error('Approve testimonial error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to approve testimonial'
            }
        });
    }
};

export const rejectTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Testimonial not found' }
            });
        }

        await testimonial.update({ status: 'rejected' });

        res.json({
            success: true,
            message: 'Testimonial rejected successfully'
        });
    } catch (error) {
        console.error('Reject testimonial error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to reject testimonial'
            }
        });
    }
};

// ========================
// AFFILIATE MANAGEMENT (Admin)
// ========================

// Approve affiliate application
export const approveAffiliate = async (req, res) => {
    try {
        const { id } = req.params;
        const affiliate = await Affiliate.findByPk(id);
        if (!affiliate) {
            return res.status(404).json({ success: false, error: { message: 'Affiliate not found' } });
        }
        if (affiliate.status !== 'pending') {
            return res.status(400).json({ success: false, error: { message: `Affiliate is already ${affiliate.status}` } });
        }

        await affiliate.update({
            status: 'active',
            approvedAt: new Date(),
            approvedBy: req.user.id
        });

        // Update user role to affiliate
        await User.update({ role: 'affiliate' }, { where: { id: affiliate.userId } });

        res.json({ success: true, message: 'Affiliate approved successfully', data: affiliate });
    } catch (error) {
        console.error('Approve affiliate error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to approve affiliate' } });
    }
};

// Reject affiliate application
export const rejectAffiliate = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const affiliate = await Affiliate.findByPk(id);
        if (!affiliate) {
            return res.status(404).json({ success: false, error: { message: 'Affiliate not found' } });
        }

        await affiliate.update({
            status: 'rejected',
            rejectionReason: reason || 'Application rejected by admin'
        });

        res.json({ success: true, message: 'Affiliate rejected', data: affiliate });
    } catch (error) {
        console.error('Reject affiliate error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to reject affiliate' } });
    }
};

// Update affiliate status (suspend/reactivate)
export const updateAffiliateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
        }

        const affiliate = await Affiliate.findByPk(id);
        if (!affiliate) {
            return res.status(404).json({ success: false, error: { message: 'Affiliate not found' } });
        }

        await affiliate.update({ status });
        res.json({ success: true, message: `Affiliate status updated to ${status}`, data: affiliate });
    } catch (error) {
        console.error('Update affiliate status error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to update affiliate status' } });
    }
};

// Get single affiliate detail
export const getAffiliateDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const affiliate = await Affiliate.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'created_at'] },
                {
                    model: Referral,
                    as: 'referrals',
                    include: [{ model: User, as: 'referredUser', attributes: ['firstName', 'lastName', 'email'] }],
                    order: [['created_at', 'DESC']]
                },
                {
                    model: Commission,
                    as: 'commissions',
                    order: [['created_at', 'DESC']],
                    limit: 50
                },
                {
                    model: Payout,
                    as: 'payouts',
                    order: [['requestedAt', 'DESC']]
                }
            ]
        });

        if (!affiliate) {
            return res.status(404).json({ success: false, error: { message: 'Affiliate not found' } });
        }

        res.json({ success: true, data: affiliate });
    } catch (error) {
        console.error('Get affiliate detail error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch affiliate details' } });
    }
};

// Get pending payouts (from Payout model)
export const getPendingPayouts = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;

        const payouts = await Payout.findAll({
            where,
            include: [{
                model: Affiliate,
                as: 'affiliate',
                include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }]
            }],
            order: [['requested_at', 'DESC']]
        });

        // Map to a format the frontend expects
        const data = payouts.map(p => ({
            id: p.id,
            affiliateName: p.affiliate?.user ? `${p.affiliate.user.firstName} ${p.affiliate.user.lastName}` : 'Unknown',
            affiliateEmail: p.affiliate?.user?.email || 'Unknown',
            amount: parseFloat(p.amount),
            status: p.status,
            requestDate: p.requestedAt,
            payoutMethod: p.payoutMethod,
            payoutDetails: p.payoutDetails,
            transactionRef: p.transactionRef,
            adminNotes: p.adminNotes
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get pending payouts error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch payouts' } });
    }
};

// Approve a payout (new Payout model)
export const approvePayoutNew = async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionRef, adminNotes } = req.body;

        const payout = await Payout.findByPk(id, {
            include: [{ model: Affiliate, as: 'affiliate' }]
        });
        if (!payout || payout.status !== 'requested') {
            return res.status(404).json({ success: false, error: { message: 'Payout request not found or already processed' } });
        }

        const t = await Payout.sequelize.transaction();
        try {
            await payout.update({
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: req.user.id,
                transactionRef,
                adminNotes
            }, { transaction: t });

            await t.commit();
            res.json({ success: true, message: 'Payout approved successfully' });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Approve payout error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to approve payout' } });
    }
};

// Mark payout as paid
export const markPayoutPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionRef } = req.body;

        const payout = await Payout.findByPk(id, {
            include: [{ model: Affiliate, as: 'affiliate' }]
        });
        if (!payout || !['approved', 'requested'].includes(payout.status)) {
            return res.status(404).json({ success: false, error: { message: 'Payout not found or invalid state' } });
        }

        const t = await Payout.sequelize.transaction();
        try {
            await payout.update({
                status: 'paid',
                processedAt: new Date(),
                transactionRef: transactionRef || payout.transactionRef
            }, { transaction: t });

            // Update affiliate earnings
            if (payout.affiliate) {
                await payout.affiliate.decrement('pendingEarnings', { by: payout.amount, transaction: t });
                await payout.affiliate.increment('paidEarnings', { by: payout.amount, transaction: t });
            }

            await t.commit();
            res.json({ success: true, message: 'Payout marked as paid' });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Mark payout paid error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to mark payout as paid' } });
    }
};

// Reject a payout
export const rejectPayout = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const payout = await Payout.findByPk(id);
        if (!payout || payout.status !== 'requested') {
            return res.status(404).json({ success: false, error: { message: 'Payout not found or already processed' } });
        }

        await payout.update({
            status: 'rejected',
            rejectionReason: reason || 'Rejected by admin'
        });

        res.json({ success: true, message: 'Payout rejected' });
    } catch (error) {
        console.error('Reject payout error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to reject payout' } });
    }
};

// Bulk payout action
export const bulkPayoutAction = async (req, res) => {
    try {
        const { payoutIds, action } = req.body; // action: 'approve' | 'reject' | 'paid'

        if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
            return res.status(400).json({ success: false, error: { message: 'No payout IDs provided' } });
        }

        let updateData = {};
        if (action === 'approve') {
            updateData = { status: 'approved', approvedAt: new Date(), approvedBy: req.user.id };
        } else if (action === 'reject') {
            updateData = { status: 'rejected' };
        } else if (action === 'paid') {
            updateData = { status: 'paid', processedAt: new Date() };
        } else {
            return res.status(400).json({ success: false, error: { message: 'Invalid action' } });
        }

        await Payout.update(updateData, {
            where: { id: { [Op.in]: payoutIds } }
        });

        // If marking as paid, update affiliate earnings
        if (action === 'paid') {
            const payouts = await Payout.findAll({
                where: { id: { [Op.in]: payoutIds } },
                include: [{ model: Affiliate, as: 'affiliate' }]
            });
            for (const payout of payouts) {
                if (payout.affiliate) {
                    await payout.affiliate.decrement('pendingEarnings', { by: payout.amount });
                    await payout.affiliate.increment('paidEarnings', { by: payout.amount });
                }
            }
        }

        res.json({ success: true, message: `${payoutIds.length} payouts ${action}d successfully` });
    } catch (error) {
        console.error('Bulk payout action error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to process bulk payout action' } });
    }
};

// Fraud detection
export const getFraudFlags = async (req, res) => {
    try {
        const flags = await affiliateService.detectFraud();
        res.json({ success: true, data: flags });
    } catch (error) {
        console.error('Get fraud flags error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to detect fraud' } });
    }
};

// Affiliate Resource Management
export const getAffiliateResources = async (req, res) => {
    try {
        const resources = await AffiliateResource.findAll({
            include: [{ model: User, as: 'uploader', attributes: ['firstName', 'lastName'] }],
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: resources });
    } catch (error) {
        console.error('Get affiliate resources error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch resources' } });
    }
};

export const createAffiliateResource = async (req, res) => {
    try {
        const { title, description, category, fileUrl, thumbnailUrl, fileName, fileSize, fileType, dimensions } = req.body;

        const resource = await AffiliateResource.create({
            title,
            description,
            category: category || 'banner',
            fileUrl,
            thumbnailUrl,
            fileName,
            fileSize,
            fileType,
            dimensions,
            uploadedBy: req.user.id
        });

        res.status(201).json({ success: true, message: 'Resource created', data: resource });
    } catch (error) {
        console.error('Create affiliate resource error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to create resource' } });
    }
};

export const deleteAffiliateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await AffiliateResource.findByPk(id);
        if (!resource) {
            return res.status(404).json({ success: false, error: { message: 'Resource not found' } });
        }

        await resource.destroy();
        res.json({ success: true, message: 'Resource deleted' });
    } catch (error) {
        console.error('Delete affiliate resource error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to delete resource' } });
    }
};

export const toggleAffiliateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await AffiliateResource.findByPk(id);
        if (!resource) {
            return res.status(404).json({ success: false, error: { message: 'Resource not found' } });
        }

        await resource.update({ isActive: !resource.isActive });
        res.json({ success: true, message: `Resource ${resource.isActive ? 'activated' : 'deactivated'}`, data: resource });
    } catch (error) {
        console.error('Toggle affiliate resource error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to toggle resource' } });
    }
};

// ========================================
// SUBSCRIPTION MANAGEMENT
// ========================================

export const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findAll({
            where: { status: 'active' },
            order: [['price', 'ASC']]
        });
        res.json({ success: true, data: plans });
    } catch (error) {
        console.error('Get subscription plans error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to get plans' } });
    }
};

export const assignSubscription = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { userId } = req.params;
        const { planId, duration, startDate: customStartDate } = req.body;

        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ success: false, error: { message: 'User not found' } });
        }

        const plan = await SubscriptionPlan.findByPk(planId, { transaction: t });
        if (!plan) {
            await t.rollback();
            return res.status(404).json({ success: false, error: { message: 'Subscription plan not found' } });
        }

        // Calculate dates
        const startDate = customStartDate ? new Date(customStartDate) : new Date();
        const endDate = new Date(startDate);
        const planDuration = duration || plan.duration;

        if (planDuration === 'weekly') endDate.setDate(endDate.getDate() + 7);
        else if (planDuration === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
        else if (planDuration === 'quarterly') endDate.setMonth(endDate.getMonth() + 3);
        else if (planDuration === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);
        else endDate.setMonth(endDate.getMonth() + 1);

        // 1. Deactivate existing subscriptions
        await Subscription.update(
            { status: 'cancelled', cancelledAt: new Date(), cancellationReason: 'Reassigned by Admin' },
            { where: { userId, status: 'active' }, transaction: t }
        );

        // 2. Create new subscription
        const subscription = await Subscription.create({
            userId,
            planId: plan.id,
            status: 'active',
            startDate,
            endDate,
            nextBillingDate: endDate,
            autoRenew: false, // Admin-assigned = manual
            graphicsCreditsRemaining: plan.monthlyGraphicsCredits || 0,
            videoCreditsRemaining: plan.monthlyVideoCredits || 0,
            webCreditsRemaining: plan.monthlyWebCredits || 0,
            creditsResetDate: endDate,
            paymentMethod: 'Admin Assigned',
            paymentId: `ADMIN-MANUAL-${Date.now()}`
        }, { transaction: t });

        // 3. Create Payment Record (for tracking)
        const payment = await Payment.create({
            userId,
            subscriptionId: subscription.id,
            amount: parseFloat(plan.price) || 0,
            currency: plan.currency || 'INR',
            status: 'completed',
            paymentMethod: 'manual',
            paymentGateway: 'manual',
            gatewayPaymentId: subscription.paymentId,
            paidAt: new Date(),
            metadata: { assignedBy: req.user.id, reason: 'Manual admin assignment' }
        }, { transaction: t });

        // 4. Create Financial Log
        await FinancialLog.create({
            type: 'revenue',
            category: 'subscription',
            amount: payment.amount,
            currency: payment.currency,
            status: 'completed',
            paymentId: payment.id,
            userId,
            relatedId: subscription.id,
            description: `Manual subscription assignment for ${plan.name} by Admin`,
            metadata: { adminId: req.user.id }
        }, { transaction: t });

        // ========================================
        // AFFILIATE COMMISSION PROCESSING
        // ========================================
        let commissionInfo = null;

        try {
            // Check if this user was referred by an affiliate
            const referral = await Referral.findOne({
                where: {
                    referredUserId: userId,
                    [Op.or]: [
                        { status: { [Op.in]: ['registered', 'subscribed'] } },
                        { status: 'converted', commissionAmount: null }
                    ]
                },
                include: [{ model: Affiliate, as: 'affiliate' }],
                transaction: t
            });

            if (referral && referral.affiliate && referral.affiliate.status === 'active') {
                const planPrice = parseFloat(plan.price) || 0;

                if (planPrice > 0) {
                    // Award the commission linking it to the manual payment record
                    const result = await affiliateService.processReferralConversion(
                        userId,
                        subscription.id,
                        planPrice,
                        plan.currency || 'INR',
                        payment.id,
                        t // Pass the transaction
                    );

                    if (result) {
                        const affiliate = referral.affiliate;
                        const commRate = affiliate.commissionRate;
                        let commAmount;
                        if (affiliate.commissionType === 'fixed') {
                            commAmount = parseFloat(commRate);
                        } else {
                            commAmount = (planPrice * commRate) / 100;
                        }

                        const affiliateUser = await User.findByPk(affiliate.userId, {
                            attributes: ['firstName', 'lastName', 'email'],
                            transaction: t
                        });

                        commissionInfo = {
                            affiliateName: affiliateUser ? `${affiliateUser.firstName} ${affiliateUser.lastName}` : 'Unknown',
                            affiliateEmail: affiliateUser?.email,
                            commissionAmount: commAmount,
                            currency: plan.currency || 'INR'
                        };
                    }
                }
            }
        } catch (commissionError) {
            console.error('Commission processing error (non-blocking):', commissionError);
            // We don't fail the whole transaction for commission errors
        }

        await t.commit();

        // Re-fetch with plan included for response
        const fullSubscription = await Subscription.findByPk(subscription.id, {
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        const message = commissionInfo
            ? `${plan.name} plan assigned. Commission of ₹${commissionInfo.commissionAmount} awarded to ${commissionInfo.affiliateName}.`
            : `${plan.name} plan assigned successfully.`;

        res.json({
            success: true,
            message,
            data: fullSubscription,
            commission: commissionInfo
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Assign subscription error:', error);
        res.status(500).json({ success: false, error: { message: error.message || 'Failed to assign subscription' } });
    }
};

export const removeSubscription = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: { message: 'User not found' } });
        }

        const updated = await Subscription.update(
            { status: 'cancelled', cancelledAt: new Date(), cancellationReason: 'Admin removed plan' },
            { where: { userId, status: 'active' } }
        );

        res.json({
            success: true,
            message: `Subscription removed for ${user.firstName} ${user.lastName}`,
            data: { deactivated: updated[0] }
        });
    } catch (error) {
        console.error('Remove subscription error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to remove subscription' } });
    }
};
