import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../config/index.js';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret
});

export const createRazorpayOrder = async (req, res) => {
    try {
        const { planId, amount, currency = 'INR' } = req.body;

        const options = {
            amount: amount * 100, // Convert to paise
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
        console.error('Razorpay order creation error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PAYMENT_ERROR',
                message: 'Failed to create payment order'
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
                // Handle successful payment
                console.log('Payment captured:', payload.payment.entity.id);
                // TODO: Update subscription status
                break;

            case 'payment.failed':
                // Handle failed payment
                console.log('Payment failed:', payload.payment.entity.id);
                // TODO: Update subscription status
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
