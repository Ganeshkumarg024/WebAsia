import Stripe from 'stripe';
import config from '../config/index.js';

// Initialize Stripe
const stripe = new Stripe(config.stripe.secretKey);

export const createStripeCheckoutSession = async (req, res) => {
    try {
        const { planId, planName, amount, currency = 'usd' } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: planName,
                            description: `WebAsia ${planName} Subscription`
                        },
                        unit_amount: amount * 100, // Convert to cents
                        recurring: {
                            interval: 'month'
                        }
                    },
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: `${config.frontend.url}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.frontend.url}/subscription/cancel`,
            client_reference_id: req.user.id,
            metadata: {
                userId: req.user.id,
                planId,
                email: req.user.email
            }
        });

        res.json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url
            }
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PAYMENT_ERROR',
                message: 'Failed to create checkout session'
            }
        });
    }
};

export const getStripeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            success: true,
            data: {
                status: session.payment_status,
                customerEmail: session.customer_email,
                subscriptionId: session.subscription
            }
        });
    } catch (error) {
        console.error('Stripe session retrieval error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SESSION_ERROR',
                message: 'Failed to retrieve session'
            }
        });
    }
};

export const cancelStripeSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        const subscription = await stripe.subscriptions.cancel(subscriptionId);

        res.json({
            success: true,
            message: 'Stripe subscription cancelled',
            data: {
                id: subscription.id,
                status: subscription.status
            }
        });
    } catch (error) {
        console.error('Stripe cancellation error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CANCELLATION_ERROR',
                message: 'Failed to cancel subscription'
            }
        });
    }
};

export const handleStripeWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = config.stripe.webhookSecret;

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('Checkout completed:', session.id);
                // TODO: Create subscription in database
                break;

            case 'customer.subscription.created':
                const subscription = event.data.object;
                console.log('Subscription created:', subscription.id);
                break;

            case 'customer.subscription.updated':
                const updatedSubscription = event.data.object;
                console.log('Subscription updated:', updatedSubscription.id);
                // TODO: Update subscription status
                break;

            case 'customer.subscription.deleted':
                const deletedSubscription = event.data.object;
                console.log('Subscription deleted:', deletedSubscription.id);
                // TODO: Cancel subscription in database
                break;

            case 'invoice.payment_succeeded':
                const invoice = event.data.object;
                console.log('Payment succeeded:', invoice.id);
                // TODO: Reset credits for renewal
                break;

            case 'invoice.payment_failed':
                const failedInvoice = event.data.object;
                console.log('Payment failed:', failedInvoice.id);
                // TODO: Mark subscription as past_due
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed'
        });
    }
};
