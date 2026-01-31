import { Request, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getUnassignedRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: {
                status: 'active',
                assignedDesignerId: null
            },
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            order: [
                ['priority', 'DESC'],
                ['createdAt', 'ASC']
            ]
        });

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get unassigned requests error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch unassigned requests'
            }
        });
    }
};

export const assignRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { designerId } = req.body;

        const request = await Request.findByPk(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Verify designer exists and has designer role
        const designer = await User.findOne({
            where: {
                id: designerId,
                role: 'designer',
                status: 'active'
            }
        });

        if (!designer) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INVALID_DESIGNER',
                    message: 'Designer not found or inactive'
                }
            });
        }

        // Calculate deadline
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + (request.slaHours || 48));

        await request.update({
            assignedDesignerId: designerId,
            assignedManagerId: req.user.id,
            assignedAt: new Date(),
            deadline,
            status: 'assigned'
        });

        await request.reload({
            include: [
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
        });

        // TODO: Send notification to designer

        res.json({
            success: true,
            message: 'Request assigned successfully',
            data: request
        });
    } catch (error) {
        console.error('Assign request error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to assign request'
            }
        });
    }
};

export const reassignRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { designerId, reason } = req.body;

        const request = await Request.findByPk(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        const designer = await User.findOne({
            where: {
                id: designerId,
                role: 'designer',
                status: 'active'
            }
        });

        if (!designer) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INVALID_DESIGNER',
                    message: 'Designer not found or inactive'
                }
            });
        }

        await request.update({
            assignedDesignerId: designerId,
            assignedAt: new Date(),
            specifications: {
                ...request.specifications,
                reassignmentHistory: [
                    ...(request.specifications?.reassignmentHistory || []),
                    {
                        from: request.assignedDesignerId,
                        to: designerId,
                        reason,
                        timestamp: new Date()
                    }
                ]
            }
        });

        res.json({
            success: true,
            message: 'Request reassigned successfully',
            data: request
        });
    } catch (error) {
        console.error('Reassign request error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to reassign request'
            }
        });
    }
};

export const getDesignerWorkload = async (req, res) => {
    try {
        const designers = await User.findAll({
            where: {
                role: 'designer',
                status: 'active'
            },
            attributes: ['id', 'firstName', 'lastName', 'email']
        });

        const workload = await Promise.all(
            designers.map(async (designer) => {
                const activeRequests = await Request.count({
                    where: {
                        assignedDesignerId: designer.id,
                        status: { [Op.in]: ['assigned', 'in_progress', 'pending_review'] }
                    }
                });

                const completedToday = await Request.count({
                    where: {
                        assignedDesignerId: designer.id,
                        status: 'completed',
                        completedAt: {
                            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    }
                });

                return {
                    designer: designer.toJSON(),
                    activeRequests,
                    completedToday,
                    availability: activeRequests < 5 ? 'available' : 'busy'
                };
            })
        );

        res.json({
            success: true,
            data: workload
        });
    } catch (error) {
        console.error('Get designer workload error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch designer workload'
            }
        });
    }
};
