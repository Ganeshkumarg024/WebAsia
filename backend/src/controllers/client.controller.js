import { Request, User, Subscription, SubscriptionPlan, File, Testimonial } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get client dashboard statistics
 * GET /api/client/dashboard/stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get active subscription
        const subscription = await Subscription.findOne({
            where: {
                userId,
                status: 'active'
            },
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        if (!subscription) {
            return res.json({
                success: true,
                data: {
                    hasSubscription: false,
                    activeRequests: 0,
                    completedRequests: 0,
                    creditsRemaining: null,
                    subscription: null
                }
            });
        }

        // Get request counts
        const [activeRequests, completedRequests, totalRequests] = await Promise.all([
            Request.count({
                where: {
                    clientId: userId,
                    status: { [Op.in]: ['active', 'assigned', 'in_progress', 'pending_review', 'client_review'] }
                }
            }),
            Request.count({
                where: {
                    clientId: userId,
                    status: 'completed'
                }
            }),
            Request.count({
                where: { clientId: userId }
            })
        ]);

        // Calculate days until next billing
        const daysRemaining = subscription.nextBillingDate
            ? Math.ceil((new Date(subscription.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24))
            : null;

        // Get recent activity (last 5 completed requests)
        const recentActivity = await Request.findAll({
            where: {
                clientId: userId,
                status: 'completed'
            },
            include: [
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName'] }
            ],
            order: [['completedAt', 'DESC']],
            limit: 5
        });

        res.json({
            success: true,
            data: {
                hasSubscription: true,
                activeRequests,
                completedRequests,
                totalRequests,
                creditsRemaining: {
                    graphics: subscription.graphicsCreditsRemaining,
                    video: subscription.videoCreditsRemaining,
                    web: subscription.webCreditsRemaining
                },
                subscription: {
                    plan: subscription.plan.name,
                    status: subscription.status,
                    nextBillingDate: subscription.nextBillingDate,
                    daysRemaining,
                    autoRenew: subscription.autoRenew,
                    activeRequestLimit: subscription.plan.activeRequestLimit
                },
                recentActivity: recentActivity.map(req => ({
                    id: req.id,
                    title: req.title,
                    serviceType: req.serviceType,
                    completedAt: req.completedAt,
                    designer: req.designer ? {
                        name: `${req.designer.firstName} ${req.designer.lastName}`
                    } : null
                }))
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
 * Get client deliveries
 * GET /api/client/deliveries
 */
export const getDeliveries = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, serviceType } = req.query;
        const offset = (page - 1) * limit;

        const where = {
            clientId: userId,
            status: 'completed'
        };

        if (serviceType) {
            where.serviceType = serviceType;
        }

        const { count, rows: requests } = await Request.findAndCountAll({
            where,
            include: [
                {
                    model: File,
                    as: 'files',
                    where: { fileType: 'final_delivery', status: 'ready' },
                    required: true
                },
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName'] }
            ],
            order: [['completedAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                deliveries: requests.map(req => ({
                    id: req.id,
                    title: req.title,
                    serviceType: req.serviceType,
                    completedAt: req.completedAt,
                    designer: req.designer ? {
                        id: req.designer.id,
                        name: `${req.designer.firstName} ${req.designer.lastName}`
                    } : null,
                    files: req.files.map(file => ({
                        id: file.id,
                        fileName: file.fileName,
                        originalName: file.originalName,
                        fileUrl: file.fileUrl,
                        thumbnailUrl: file.thumbnailUrl,
                        fileSize: file.fileSize,
                        mimeType: file.mimeType
                    }))
                })),
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get deliveries error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch deliveries'
            }
        });
    }
};

/**
 * Get client's submitted testimonials
 * GET /api/client/testimonials
 */
export const getMyTestimonials = async (req, res) => {
    try {
        const userId = req.user.id;

        const testimonials = await Testimonial.findAll({
            where: { userId },
            include: [
                { model: Request, as: 'request', attributes: ['id', 'title', 'serviceType'] }
            ],
            order: [['createdAt', 'DESC']]
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

/**
 * Get subscription details
 * GET /api/client/subscription
 */
export const getSubscriptionDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        const subscription = await Subscription.findOne({
            where: {
                userId,
                status: { [Op.in]: ['active', 'past_due'] }
            },
            include: [{ model: SubscriptionPlan, as: 'plan' }]
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NO_SUBSCRIPTION',
                    message: 'No active subscription found'
                }
            });
        }

        res.json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Get subscription details error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch subscription details'
            }
        });
    }
};
