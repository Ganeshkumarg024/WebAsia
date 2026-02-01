import { Request, User, File, RequestActivity } from '../models/index.js';
import { Op } from 'sequelize';

export const getMyTasks = async (req, res) => {
    try {
        const { status } = req.query;

        const where = {
            assignedDesignerId: req.user.id
        };

        if (status) {
            where.status = status;
        } else {
            where.status = { [Op.in]: ['assigned', 'in_progress', 'pending_review'] };
        }

        const tasks = await Request.findAll({
            where,
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            order: [
                ['priority', 'DESC'],
                ['deadline', 'ASC']
            ]
        });

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('Get designer tasks error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch tasks'
            }
        });
    }
};

export const startTask = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findOne({
            where: {
                id,
                assignedDesignerId: req.user.id
            }
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Task not found or not assigned to you'
                }
            });
        }

        if (request.status !== 'assigned') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: 'Task already started or completed'
                }
            });
        }

        await request.update({
            status: 'in_progress',
            startedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Task started',
            data: request
        });
    } catch (error) {
        console.error('Start task error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to start task'
            }
        });
    }
};

export const submitForReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const request = await Request.findOne({
            where: {
                id,
                assignedDesignerId: req.user.id
            }
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Task not found or not assigned to you'
                }
            });
        }

        await request.update({
            status: 'pending_review',
            specifications: {
                ...request.specifications,
                designerNotes: notes,
                submittedAt: new Date()
            }
        });

        // TODO: Notify manager

        res.json({
            success: true,
            message: 'Submitted for review',
            data: request
        });
    } catch (error) {
        console.error('Submit for review error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to submit for review'
            }
        });
    }
};

export const getTaskStats = async (req, res) => {
    try {
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);

        const [activeCount, completedToday, completedThisWeek, avgCompletionTime] = await Promise.all([
            Request.count({
                where: {
                    assignedDesignerId: req.user.id,
                    status: { [Op.in]: ['assigned', 'in_progress', 'pending_review'] }
                }
            }),
            Request.count({
                where: {
                    assignedDesignerId: req.user.id,
                    status: 'completed',
                    completedAt: { [Op.gte]: today }
                }
            }),
            Request.count({
                where: {
                    assignedDesignerId: req.user.id,
                    status: 'completed',
                    completedAt: { [Op.gte]: thisWeek }
                }
            }),
            Request.findAll({
                where: {
                    assignedDesignerId: req.user.id,
                    status: 'completed',
                    startedAt: { [Op.not]: null },
                    completedAt: { [Op.not]: null }
                },
                attributes: ['startedAt', 'completedAt'],
                limit: 10,
                order: [['completedAt', 'DESC']]
            })
        ]);

        // Calculate average completion time
        let avgHours = 0;
        if (avgCompletionTime.length > 0) {
            const totalHours = avgCompletionTime.reduce((sum, req) => {
                const hours = (new Date(req.completedAt) - new Date(req.startedAt)) / (1000 * 60 * 60);
                return sum + hours;
            }, 0);
            avgHours = Math.round(totalHours / avgCompletionTime.length);
        }

        res.json({
            success: true,
            data: {
                activeTasks: activeCount,
                completedToday,
                completedThisWeek,
                averageCompletionHours: avgHours
            }
        });
    } catch (error) {
        console.error('Get task stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch task statistics'
            }
        });
    }
};

/**
 * Get designer dashboard statistics with urgent tasks and activity
 * GET /api/designer/dashboard/stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        const designerId = req.user.id;

        // Get task counts
        const [activeTasks, completedToday, pendingReview] = await Promise.all([
            Request.count({
                where: {
                    assignedDesignerId: designerId,
                    status: { [Op.in]: ['assigned', 'in_progress'] }
                }
            }),
            Request.count({
                where: {
                    assignedDesignerId: designerId,
                    status: 'completed',
                    completedAt: {
                        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            Request.count({
                where: {
                    assignedDesignerId: designerId,
                    status: 'pending_review'
                }
            })
        ]);

        // Get urgent tasks
        const urgentTasks = await Request.findAll({
            where: {
                assignedDesignerId: designerId,
                status: { [Op.in]: ['assigned', 'in_progress'] },
                [Op.or]: [
                    { priority: 'urgent' },
                    {
                        deadline: {
                            [Op.lte]: new Date(Date.now() + 24 * 60 * 60 * 1000)
                        }
                    }
                ]
            },
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl'] }
            ],
            order: [['deadline', 'ASC']],
            limit: 5
        });

        // Get recent activity
        const recentActivity = await RequestActivity.findAll({
            where: { userId: designerId },
            include: [
                { model: Request, as: 'request', attributes: ['id', 'title'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                activeTasks,
                completedToday,
                pendingReview,
                avgRating: 4.8,
                urgentTasks,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch dashboard statistics'
            }
        });
    }
};

/**
 * Get task details by ID
 * GET /api/designer/tasks/:id
 */
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const designerId = req.user.id;

        const task = await Request.findOne({
            where: {
                id,
                assignedDesignerId: designerId
            },
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'photoUrl'] },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName'] },
                { model: File, as: 'files' }
            ]
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Task not found or not assigned to you'
                }
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Get task by ID error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch task details'
            }
        });
    }
};

/**
 * Update task status
 * PATCH /api/designer/tasks/:id/status
 */
export const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const designerId = req.user.id;

        const task = await Request.findOne({
            where: {
                id,
                assignedDesignerId: designerId
            }
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Task not found'
                }
            });
        }

        const oldStatus = task.status;
        await task.update({ status });

        // Create activity
        await RequestActivity.create({
            requestId: task.id,
            userId: designerId,
            activityType: 'status_changed',
            description: notes || `Status changed from ${oldStatus} to ${status}`,
            metadata: { oldStatus, newStatus: status },
            isSystemGenerated: false
        });

        res.json({
            success: true,
            message: 'Task status updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to update task status'
            }
        });
    }
};

/**
 * Get designer analytics
 * GET /api/designer/analytics
 */
export const getAnalytics = async (req, res) => {
    try {
        const designerId = req.user.id;
        const { period = 'month' } = req.query;

        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const completedTasks = await Request.findAll({
            where: {
                assignedDesignerId: designerId,
                status: 'completed',
                completedAt: {
                    [Op.gte]: startDate
                }
            },
            attributes: ['id', 'serviceType', 'completedAt', 'startedAt'],
            order: [['completedAt', 'ASC']]
        });

        const totalCompleted = completedTasks.length;

        const avgCompletionTime = completedTasks.reduce((sum, task) => {
            if (task.startedAt && task.completedAt) {
                const hours = (new Date(task.completedAt) - new Date(task.startedAt)) / (1000 * 60 * 60);
                return sum + hours;
            }
            return sum;
        }, 0) / (totalCompleted || 1);

        const tasksByType = completedTasks.reduce((acc, task) => {
            acc[task.serviceType] = (acc[task.serviceType] || 0) + 1;
            return acc;
        }, {});

        const tasksByDate = completedTasks.reduce((acc, task) => {
            const date = new Date(task.completedAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                period,
                totalCompleted,
                avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
                clientSatisfaction: 4.8,
                tasksByType,
                tasksByDate
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
