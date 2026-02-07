import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { paymentsAPI } from '../api/payments';

/**
 * Custom hook to handle Razorpay payment integration
 */
const useRazorpay = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const processPayment = useCallback(async ({ plan, user, onSuccess, onError }) => {
        setIsProcessing(true);
        try {
            // 1. Load Razorpay script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                throw new Error('Razorpay SDK failed to load. Are you online?');
            }

            // 2. Create Order on Backend
            const orderResponse = await paymentsAPI.createRazorpayOrder({
                planId: plan.id,
                amount: plan.price,
                currency: plan.currency || 'INR'
            });

            if (!orderResponse.success) {
                throw new Error(orderResponse.error?.message || 'Failed to create payment order');
            }

            const { orderId, amount, currency, keyId } = orderResponse.data;

            // 3. Configure Razorpay Options
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: 'WebAsia Creative',
                description: `Subscription: ${plan.name} Plan`,
                image: '/assets/webasia-logo.png',
                order_id: orderId,
                handler: async (response) => {
                    try {
                        // 4. Verify Payment on Backend
                        const verifyResponse = await paymentsAPI.verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyResponse.success) {
                            if (onSuccess) onSuccess(verifyResponse.data);
                        } else {
                            throw new Error(verifyResponse.error?.message || 'Payment verification failed');
                        }
                    } catch (err) {
                        toast.error(err.message);
                        if (onError) onError(err);
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    contact: user.phone || ''
                },
                notes: {
                    planId: plan.id,
                    userId: user.id
                },
                theme: {
                    color: '#2563EB' // blue-600
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                toast.error(response.error.description);
                if (onError) onError(response.error);
                setIsProcessing(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Payment Error:', error);
            toast.error(error.message || 'Something went wrong with the payment');
            if (onError) onError(error);
            setIsProcessing(false);
        }
    }, []);

    return {
        processPayment,
        isProcessing
    };
};

export default useRazorpay;
