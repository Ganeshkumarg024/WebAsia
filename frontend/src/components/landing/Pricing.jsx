import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import useSubscriptionStore from '../../store/subscriptionStore';
import useAuthStore from '../../store/authStore';
import { initializeRazorpayPayment, initializeStripePayment } from '../../utils/payment';

const Pricing = () => {
    const navigate = useNavigate();
    const { plans, fetchPlans, isLoading } = useSubscriptionStore();
    const { isAuthenticated, user } = useAuthStore();

    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleSubscribe = async (plan) => {
        if (!isAuthenticated) {
            navigate('/register', { state: { selectedPlanId: plan.id } });
            return;
        }

        // Determine gateway (In a real app, you might let the user choose or use a default)
        const gateway = import.meta.env.VITE_PREFERRED_GATEWAY || 'razorpay';

        const onSuccess = (data) => {
            console.log('Payment successful:', data);
            navigate('/client/dashboard');
        };

        const onError = (msg) => {
            console.error('Payment error:', msg);
            alert(msg);
        };

        if (gateway === 'razorpay') {
            await initializeRazorpayPayment(plan, user, onSuccess, onError);
        } else {
            await initializeStripePayment(plan, onSuccess, onError);
        }
    };

    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <section id="pricing" className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Design{' '}
                        <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                            Without Boundaries
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Choose the plan that fits your needs. All plans include unlimited revisions.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className={`relative glass-card p-8 ${index === 1 ? 'ring-2 ring-primary-500 scale-105' : ''
                                }`}
                        >
                            {index === 1 && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                    {plan.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">{plan.description || 'Flexible creative solution'}</p>
                                <div className="flex items-baseline justify-center">
                                    <span className="text-5xl font-bold text-gray-900">
                                        {formatCurrency(plan.price, plan.currency)}
                                    </span>
                                    <span className="text-gray-600 ml-2 uppercase text-xs">/{plan.duration}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="text-gray-700">{plan.activeRequestLimit} Active Request(s)</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="text-gray-700">{plan.monthlyGraphicsCredits} Graphics Credits</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="text-gray-700">{plan.monthlyVideoCredits} Video Credits</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="text-gray-700">Unlimited Revisions</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckIcon />
                                    <span className="text-gray-700">{plan.turnaroundHours}h Turnaround</span>
                                </li>
                                {/* Dynamic Features */}
                                {plan.features && Object.entries(plan.features).map(([key, value]) => (
                                    value && (
                                        <li key={key} className="flex items-start">
                                            <CheckIcon />
                                            <span className="text-gray-700">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </span>
                                        </li>
                                    )
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan)}
                                className={`block w-full text-center py-3 rounded-full font-semibold transition-all ${index === 1
                                    ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                                    : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                {isAuthenticated ? 'Select Plan' : 'Get Started'}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-center mt-12 text-gray-600"
                >
                    <p className="text-lg">
                        All plans come with a 14-day money-back guarantee. No questions asked.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

const CheckIcon = () => (
    <svg
        className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
    >
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
        />
    </svg>
);

export default Pricing;
