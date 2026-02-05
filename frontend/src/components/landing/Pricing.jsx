import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import useSubscriptionStore from '../../store/subscriptionStore';
import useAuthStore from '../../store/authStore';
import { initializeRazorpayPayment, initializeStripePayment } from '../../utils/payment';
import AnimatedButton from '../ui/AnimatedButton';
import PricingToggle from './PricingToggle';

const Pricing = () => {
    const navigate = useNavigate();
    const { plans, fetchPlans, isLoading } = useSubscriptionStore();
    const { isAuthenticated, user } = useAuthStore();
    const [isYearly, setIsYearly] = useState(false);

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
        const finalAmount = isYearly ? amount * 12 * 0.8 : amount; // 20% discount for yearly
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(finalAmount);
    };

    return (
        <section id="pricing" className="py-20 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-900">
                        Design{' '}
                        <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                            Without Boundaries
                        </span>
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto">
                        Choose the plan that fits your needs. All plans include unlimited revisions.
                    </p>
                </motion.div>

                {/* Pricing Toggle */}
                <PricingToggle isYearly={isYearly} setIsYearly={setIsYearly} />

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => {
                        const isPopular = index === 1;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                className={`
                                    relative bg-white p-8 rounded-2xl shadow-lg
                                    transition-all duration-300
                                    ${isPopular ? 'scale-105 border-2 border-primary-500 shadow-2xl' : 'hover:shadow-xl'}
                                `}
                            >
                                {/* Most Popular Badge */}
                                {isPopular && (
                                    <div className="absolute top-0 right-0 bg-secondary-500 text-white px-4 py-2 rounded-bl-xl rounded-tr-xl text-sm font-bold">
                                        Most Popular
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-6">
                                        {plan.description || 'Flexible creative solution'}
                                    </p>
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-5xl font-bold text-gray-900">
                                            {formatCurrency(plan.price, plan.currency)}
                                        </span>
                                        <span className="text-gray-600 ml-2 text-sm">
                                            /{isYearly ? 'year' : plan.duration}
                                        </span>
                                    </div>
                                    {isYearly && (
                                        <p className="text-green-600 text-sm font-semibold mt-2">
                                            Save 20% with yearly billing
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start min-h-[44px]">
                                        <CheckIcon />
                                        <span className="text-gray-700">
                                            {plan.activeRequestLimit} Active Request{plan.activeRequestLimit > 1 ? 's' : ''} at a time
                                        </span>
                                    </li>
                                    <li className="flex items-start min-h-[44px]">
                                        <CheckIcon />
                                        <span className="text-gray-700">
                                            {plan.monthlyGraphicsCredits} Graphics Credits
                                        </span>
                                    </li>
                                    <li className="flex items-start min-h-[44px]">
                                        <CheckIcon />
                                        <span className="text-gray-700">
                                            {plan.monthlyVideoCredits} Video Credits
                                        </span>
                                    </li>
                                    <li className="flex items-start min-h-[44px]">
                                        <CheckIcon />
                                        <span className="text-gray-700">Unlimited Revisions</span>
                                    </li>
                                    <li className="flex items-start min-h-[44px]">
                                        <CheckIcon />
                                        <span className="text-gray-700">
                                            {plan.turnaroundHours}h Turnaround
                                        </span>
                                    </li>
                                    {/* Dynamic Features */}
                                    {plan.features && Object.entries(plan.features).slice(0, 1).map(([key, value]) => (
                                        value && (
                                            <li key={key} className="flex items-start min-h-[44px]">
                                                <CheckIcon />
                                                <span className="text-gray-700">
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </span>
                                            </li>
                                        )
                                    ))}
                                </ul>

                                <AnimatedButton
                                    variant={isPopular ? 'primary' : 'outline'}
                                    size="lg"
                                    onClick={() => handleSubscribe(plan)}
                                    className="w-full"
                                    loading={isLoading}
                                >
                                    {isPopular ? 'Start Free Trial' : 'Get Started'}
                                </AnimatedButton>

                                {isPopular && (
                                    <p className="text-center text-sm text-gray-500 mt-3">
                                        No credit card required
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
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
        aria-hidden="true"
    >
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
        />
    </svg>
);

export default Pricing;
