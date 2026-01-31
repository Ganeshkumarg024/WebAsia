import { SubscriptionPlan } from '../models/index.js';

export const getAllPlans = async (req, res) => {
    try {
        const { includeInactive } = req.query;

        const where = {};
        if (!includeInactive) {
            where.status = 'active';
            where.isPublic = true;
        }

        const plans = await SubscriptionPlan.findAll({
            where,
            order: [['price', 'ASC']]
        });

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch subscription plans'
            }
        });
    }
};

export const getPlanById = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await SubscriptionPlan.findByPk(id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Subscription plan not found'
                }
            });
        }

        res.json({
            success: true,
            data: plan
        });
    } catch (error) {
        console.error('Get plan error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch subscription plan'
            }
        });
    }
};

export const createPlan = async (req, res) => {
    try {
        const planData = req.body;

        // Check if slug already exists
        const existingPlan = await SubscriptionPlan.findOne({
            where: { slug: planData.slug }
        });

        if (existingPlan) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: 'Plan with this slug already exists'
                }
            });
        }

        const plan = await SubscriptionPlan.create(planData);

        res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully',
            data: plan
        });
    } catch (error) {
        console.error('Create plan error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to create subscription plan'
            }
        });
    }
};

export const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const plan = await SubscriptionPlan.findByPk(id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Subscription plan not found'
                }
            });
        }

        await plan.update(updates);

        res.json({
            success: true,
            message: 'Subscription plan updated successfully',
            data: plan
        });
    } catch (error) {
        console.error('Update plan error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to update subscription plan'
            }
        });
    }
};

export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await SubscriptionPlan.findByPk(id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Subscription plan not found'
                }
            });
        }

        // Soft delete - archive instead of deleting
        await plan.update({ status: 'archived' });

        res.json({
            success: true,
            message: 'Subscription plan archived successfully'
        });
    } catch (error) {
        console.error('Delete plan error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to delete subscription plan'
            }
        });
    }
};
