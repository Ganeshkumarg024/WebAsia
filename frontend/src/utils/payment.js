import { paymentsAPI } from '../api/payments';

/**
 * Load Razorpay SDK script dynamically
 */
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Initialize Razorpay Payment
 */
export const initializeRazorpayPayment = async (plan, user, onSuccess, onError) => {
    const res = await loadRazorpayScript();

    if (!res) {
        onError('Razorpay SDK failed to load. Are you online?');
        return;
    }

    try {
        // 1. Create order on backend
        const orderData = await paymentsAPI.createRazorpayOrder({
            planId: plan.id,
            amount: plan.price,
            currency: plan.currency || 'INR'
        });

        const { id: order_id, amount, currency } = orderData.data;

        // 2. Open Razorpay Checkout
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: amount,
            currency: currency,
            name: 'WebAsia Creative Hub',
            description: `Subscription for ${plan.name} Plan`,
            order_id: order_id,
            handler: async (response) => {
                try {
                    // 3. Verify payment on backend
                    const verificationData = await paymentsAPI.verifyRazorpayPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        planId: plan.id
                    });

                    if (verificationData.success) {
                        onSuccess(verificationData.data);
                    } else {
                        onError('Payment verification failed');
                    }
                } catch (err) {
                    onError(err.message || 'Verification error');
                }
            },
            prefill: {
                name: user?.name,
                email: user?.email,
            },
            theme: {
                color: '#2563EB', // Blue-600
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

    } catch (err) {
        onError(err.message || 'Failed to initialize payment');
    }
};

/**
 * Initialize Stripe Payment
 */
export const initializeStripePayment = async (plan, onSuccess, onError) => {
    try {
        const sessionData = await paymentsAPI.createStripeCheckout({
            planId: plan.id,
            planName: plan.name,
            amount: plan.price,
            currency: plan.currency || 'USD'
        });

        if (sessionData.success && sessionData.data.url) {
            // Redirect to Stripe Checkout
            window.location.href = sessionData.data.url;
        } else {
            onError('Failed to create Stripe checkout session');
        }
    } catch (err) {
        onError(err.message || 'Stripe initialization error');
    }
};
