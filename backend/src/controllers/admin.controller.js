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
                    order: [['createdAt', 'DESC']],
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
                    order: [['createdAt', 'ASC']]
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

        // In a real app, this would involve complex aggregations.
        // For now, returning basic stats.
        const [mrr, churn, totalRevenue] = await Promise.all([
            Subscription.sum('amount', { where: { status: 'active' } }),
            Subscription.count({ where: { status: 'cancelled' } }), // Simplified churn
            Payment.sum('amount', { where: { status: 'completed' } })
        ]);

        res.json({
            success: true,
            data: {
                mrr: mrr || 0,
                churnRate: churn ? (churn / (await Subscription.count()) * 100).toFixed(2) : 0,
                totalRevenue: totalRevenue || 0
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
            order: [['createdAt', 'DESC']]
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
                { id: { [Op.cast]: { type: DataTypes.TEXT, value: { [Op.iLike]: `%${search}%` } } } } // Simplified for UUID search
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
            order: [['createdAt', 'DESC']]
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
            order: [['createdAt', 'DESC']]
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
