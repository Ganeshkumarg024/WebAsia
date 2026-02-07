import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../config/index.js';
import { paymentService } from '../services/payment.service.js';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret
});

export const createRazorpayOrder = async (req, res) => {
    try {
        const { planId, amount, currency = 'INR' } = req.body;

        // Check if Razorpay keys are placeholders
        if (config.razorpay.keyId.startsWith('your-') || config.razorpay.keySecret.startsWith('your-')) {
            console.error('Razorpay Error: API keys are placeholders. Please set real keys in .env');
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Razorpay API keys are not configured. Please contact the administrator.'
                }
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise and ensure integer
            currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user.id,
                planId,
                email: req.user.email
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: config.razorpay.keyId
            }
        });
    } catch (error) {
        console.error('Razorpay order creation error details:', {
            message: error.message,
            statusCode: error.statusCode,
            description: error.description,
            metadata: error.metadata
        });

        let errorMessage = 'Failed to create payment order';
        let errorCode = 'PAYMENT_ERROR';

        if (error.statusCode === 401) {
            errorMessage = 'Invalid Razorpay API keys. Please verify your configuration.';
            errorCode = 'AUTH_ERROR';
        }

        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: errorCode,
                message: errorMessage,
                details: error.description || error.message
            }
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', config.razorpay.keySecret)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SIGNATURE',
                    message: 'Payment verification failed'
                }
            });
        }

        // Fetch payment details
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                status: payment.status,
                amount: payment.amount / 100,
                method: payment.method
            }
        });
    } catch (error) {
        console.error('Razorpay verification error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'VERIFICATION_ERROR',
                message: 'Payment verification failed'
            }
        });
    }
};

export const handleRazorpayWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookSecret = config.razorpay.webhookSecret;

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (webhookSignature !== expectedSignature) {
            return res.status(400).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        switch (event) {
            case 'payment.captured':
                await paymentService.handleSuccessfulPayment({
                    userId: payload.payment.entity.notes.userId,
                    planId: payload.payment.entity.notes.planId,
                    amount: payload.payment.entity.amount / 100,
                    currency: payload.payment.entity.currency,
                    gateway: 'razorpay',
                    gatewayOrderId: payload.payment.entity.order_id,
                    gatewayPaymentId: payload.payment.entity.id,
                    gatewaySignature: webhookSignature,
                    paymentMethod: payload.payment.entity.method,
                    metadata: payload.payment.entity.notes
                });
                break;

            case 'payment.failed':
                await paymentService.handleFailedPayment({
                    userId: payload.payment.entity.notes.userId,
                    gatewayOrderId: payload.payment.entity.order_id,
                    gatewayPaymentId: payload.payment.entity.id,
                    failureReason: payload.payment.entity.error_description,
                    gateway: 'razorpay',
                    amount: payload.payment.entity.amount / 100
                });
                break;

            case 'subscription.charged':
                // Handle subscription renewal
                console.log('Subscription charged:', payload.subscription.entity.id);
                // TODO: Renew subscription and reset credits
                break;

            default:
                console.log('Unhandled event:', event);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Razorpay webhook error:', error);
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed'
        });
    }
};
