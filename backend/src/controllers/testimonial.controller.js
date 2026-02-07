import { Testimonial, User, Request } from '../models/index.js';
import { validationResult } from 'express-validator';

export const submitTestimonial = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { requestId, rating, content, title, isPublic, serviceType } = req.body;

        // Verify request belongs to user if requestId is provided
        if (requestId) {
            const request = await Request.findOne({ where: { id: requestId, clientId: req.user.id } });
            if (!request) {
                return res.status(403).json({ success: false, error: { message: 'Invalid request ID for this user' } });
            }
        }

        const testimonial = await Testimonial.create({
            userId: req.user.id,
            requestId,
            rating,
            content,
            title,
            isPublic: isPublic !== undefined ? isPublic : true,
            serviceType,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Thank you for your feedback! It will be reviewed shortly.',
            data: testimonial
        });
    } catch (error) {
        console.error('Submit testimonial error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to submit feedback' } });
    }
};

export const getPublicTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.findAll({
            where: { status: 'approved', isPublic: true },
            include: [{
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'photoUrl']
            }],
            order: [['featured', 'DESC'], ['displayOrder', 'ASC'], ['created_at', 'DESC']],
            limit: 20
        });

        res.json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        console.error('Get public testimonials error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch testimonials' } });
    }
};

export const getMyTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.findAll({
            where: { userId: req.user.id },
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        console.error('Get my testimonials error:', error);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch testimonials' } });
    }
};
