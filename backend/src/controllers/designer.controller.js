import { Request, User } from '../models/index.js';
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
