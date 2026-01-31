import { Request, User, Subscription, SubscriptionPlan } from '../models/index.js';
import { deductCredits } from './subscription.controller.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const createRequest = async (req, res) => {
    try {
        const {
            serviceType,
            title,
            description,
            specifications,
            priority = 'normal'
        } = req.body;

        // Get user's active subscription
        const subscription = await Subscription.findOne({
            where: {
                userId: req.user.id,
                status: 'active'
            },
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        if (!subscription) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'NO_SUBSCRIPTION',
                    message: 'Active subscription required to create requests'
                }
            });
        }

        // Check if user has credits for this service type
        const creditField = {
            'graphic_design': 'graphicsCreditsRemaining',
            'video_production': 'videoCreditsRemaining',
            'web_development': 'webCreditsRemaining'
        }[serviceType];

        if (creditField && subscription[creditField] <= 0) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_CREDITS',
                    message: `No ${serviceType.replace('_', ' ')} credits remaining`
                }
            });
        }

        // Check active request limit
        const activeRequestsCount = await Request.count({
            where: {
                clientId: req.user.id,
                status: { [Op.in]: ['active', 'assigned', 'in_progress', 'pending_review', 'client_review'] }
            }
        });

        if (activeRequestsCount >= subscription.plan.activeRequestLimit) {
            // Add to queue
            const queuePosition = await Request.count({
                where: {
                    clientId: req.user.id,
                    status: 'queued'
                }
            }) + 1;

            const request = await Request.create({
                clientId: req.user.id,
                subscriptionId: subscription.id,
                serviceType,
                title,
                description,
                specifications,
                status: 'queued',
                priority,
                queuePosition,
                slaHours: subscription.plan.turnaroundHours
            });

            return res.status(201).json({
                success: true,
                message: 'Request added to queue',
                data: request
            });
        }

        // Create active request
        const request = await Request.create({
            clientId: req.user.id,
            subscriptionId: subscription.id,
            serviceType,
            title,
            description,
            specifications,
            status: 'active',
            priority,
            slaHours: subscription.plan.turnaroundHours
        });

        res.status(201).json({
            success: true,
            message: 'Request created successfully',
            data: request
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to create request'
            }
        });
    }
};

export const getMyRequests = async (req, res) => {
    try {
        const { status, serviceType } = req.query;

        const where = { clientId: req.user.id };

        if (status) {
            where.status = status;
        }

        if (serviceType) {
            where.serviceType = serviceType;
        }

        const requests = await Request.findAll({
            where,
            include: [
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch requests'
            }
        });
    }
};

export const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findOne({
            where: { id },
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Check authorization
        const isAuthorized =
            request.clientId === req.user.id ||
            request.assignedDesignerId === req.user.id ||
            request.assignedManagerId === req.user.id ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                }
            });
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch request'
            }
        });
    }
};

export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body;

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

        // Status transition logic
        const updates = { status };

        if (status === 'in_progress' && !request.startedAt) {
            updates.startedAt = new Date();
        }

        if (status === 'completed') {
            updates.completedAt = new Date();

            // Deduct credits
            try {
                await deductCredits(request.subscriptionId, request.serviceType, 1);
            } catch (error) {
                console.error('Credit deduction error:', error);
            }

            // Activate next queued request
            await activateNextQueuedRequest(request.clientId);
        }

        await request.update(updates);

        res.json({
            success: true,
            message: 'Request status updated',
            data: request
        });
    } catch (error) {
        console.error('Update request status error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to update request status'
            }
        });
    }
};

export const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const request = await Request.findOne({
            where: {
                id,
                clientId: req.user.id
            }
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        if (['completed', 'cancelled'].includes(request.status)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: 'Cannot cancel completed or already cancelled request'
                }
            });
        }

        await request.update({
            status: 'cancelled',
            specifications: {
                ...request.specifications,
                cancellationReason: reason
            }
        });

        // Activate next queued request
        await activateNextQueuedRequest(req.user.id);

        res.json({
            success: true,
            message: 'Request cancelled successfully',
            data: request
        });
    } catch (error) {
        console.error('Cancel request error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to cancel request'
            }
        });
    }
};

// Helper function to activate next queued request
async function activateNextQueuedRequest(clientId) {
    try {
        const nextRequest = await Request.findOne({
            where: {
                clientId,
                status: 'queued'
            },
            order: [['queuePosition', 'ASC']]
        });

        if (nextRequest) {
            await nextRequest.update({
                status: 'active',
                queuePosition: null
            });

            // Update queue positions for remaining requests
            await Request.update(
                { queuePosition: sequelize.literal('queue_position - 1') },
                {
                    where: {
                        clientId,
                        status: 'queued',
                        queuePosition: { [Op.gt]: nextRequest.queuePosition }
                    }
                }
            );
        }
    } catch (error) {
        console.error('Activate next queued request error:', error);
    }
}
