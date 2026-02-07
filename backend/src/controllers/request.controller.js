import { deductCredits, refundCredits } from './subscription.controller.js';
import { Request, User, Subscription, SubscriptionPlan, File, RequestActivity } from '../models/index.js';
import { subscriptionService } from '../services/subscription.service.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { validationResult } from 'express-validator';

export const createRequest = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: errors.array()
                }
            });
        }

        const {
            serviceType,
            title,
            description,
            specifications,
            priority = 'normal'
        } = req.body;

        // Run expiry check
        await subscriptionService.checkSubscriptionStatus(req.user.id);

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



        // Deduct credits immediately upon creation
        try {
            await deductCredits(subscription.id, serviceType, 1);
        } catch (error) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'CREDIT_DEDUCTION_FAILED',
                    message: 'Failed to deduct credits. Please try again.'
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

            // Create activity
            await RequestActivity.create({
                requestId: request.id,
                userId: req.user.id,
                activityType: 'created',
                description: `Request created and added to queue at position ${queuePosition}`,
                isSystemGenerated: true
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

        // Create activity
        await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: 'created',
            description: 'Request created',
            isSystemGenerated: true
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
            order: [['created_at', 'DESC']]
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
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: File, as: 'files' }
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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: errors.array()
                }
            });
        }

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

            // Deduct credits logic moved to creation time

            // Activate next queued request
            await activateNextQueuedRequest(request.clientId);
        }

        await request.update(updates);

        // Create activity
        await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: status === 'completed' ? 'completed' : 'status_changed',
            description: `Status changed to ${status}`,
            metadata: { previousStatus: request.status, newStatus: status },
            isSystemGenerated: false
        });

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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: errors.array()
                }
            });
        }

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

        // Refund credits
        try {
            await refundCredits(request.subscriptionId, request.serviceType, 1);
        } catch (refundError) {
            console.error('Failed to refund credits for cancelled request:', refundError);
            // We don't fail the request cancellation if refund fails, but we log it
        }

        // Create activity
        await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: 'cancelled',
            description: `Request cancelled${reason ? `: ${reason}` : ''}`,
            isSystemGenerated: false
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

/**
 * Submit feedback for a request
 * POST /api/requests/:id/feedback
 */
export const submitFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback, requestRevision = false } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: errors.array()
                }
            });
        }

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

        // Update request status if revision requested
        if (requestRevision) {
            await request.update({ status: 'revision_requested' });
        }

        // Create activity
        await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: requestRevision ? 'revision_requested' : 'feedback_received',
            description: feedback,
            metadata: { requestRevision },
            isSystemGenerated: false
        });

        res.json({
            success: true,
            message: 'Feedback submitted successfully',
            data: request
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to submit feedback'
            }
        });
    }
};

/**
 * Approve request
 * POST /api/requests/:id/approve
 */
export const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;

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

        await request.update({
            status: 'completed',
            completedAt: new Date()
        });

        // Create activity
        await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: 'approved_by_client',
            description: 'Client approved the final delivery',
            isSystemGenerated: false
        });

        // Deduct credits logic moved to creation time

        // Activate next queued request
        await activateNextQueuedRequest(req.user.id);

        res.json({
            success: true,
            message: 'Request approved successfully',
            data: request
        });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to approve request'
            }
        });
    }
};

/**
 * Get request activity timeline
 * GET /api/requests/:id/activity
 */
export const getRequestActivity = async (req, res) => {
    try {
        const { id } = req.params;

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

        const activities = await RequestActivity.findAll({
            where: { requestId: id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Get request activity error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch request activity'
            }
        });
    }
};

/**
 * Change request priority
 * PATCH /api/requests/:id/priority
 */
export const changePriority = async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: errors.array()
                }
            });
        }

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

        const oldPriority = request.priority;
        await request.update({ priority });

        // Create activity
        await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: 'priority_changed',
            description: `Priority changed from ${oldPriority} to ${priority}`,
            metadata: { oldPriority, newPriority: priority },
            isSystemGenerated: false
        });

        res.json({
            success: true,
            message: 'Priority updated successfully',
            data: request
        });
    } catch (error) {
        console.error('Change priority error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to change priority'
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

            // Create activity
            await RequestActivity.create({
                requestId: nextRequest.id,
                userId: clientId,
                activityType: 'status_changed',
                description: 'Request moved from queue to active',
                isSystemGenerated: true
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
