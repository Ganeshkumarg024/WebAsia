import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import useSubscriptionStore from '../../store/subscriptionStore';
import useAuthStore from '../../store/authStore';
import { initializeRazorpayPayment, initializeStripePayment } from '../../utils/payment';
import AnimatedButton from '../ui/AnimatedButton';
import PricingToggle from './PricingToggle';
import useCountUp from '../../hooks/useCountUp';
import useMediaQuery from '../../hooks/useMediaQuery';

const Pricing = () => {
    const navigate = useNavigate();
    const { plans, fetchPlans, isLoading } = useSubscriptionStore();
    const { isAuthenticated, user } = useAuthStore();
    const [isYearly, setIsYearly] = useState(false);
    const { isDesktop } = useMediaQuery();

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
        <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
            {/* 3D Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -180, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <motion.h2
                        className="text-5xl md:text-6xl font-bold mb-6 text-gray-900"
                        style={{
                            textShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        Design{' '}
                        <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 bg-clip-text text-transparent">
                            Without Boundaries
                        </span>
                    </motion.h2>
                    <p className="text-xl leading-relaxed text-gray-600 max-w-3xl mx-auto">
                        Choose the plan that fits your needs. All plans include unlimited revisions.
                    </p>
                </motion.div>

                {/* Pricing Toggle with 3D Effect */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <PricingToggle isYearly={isYearly} setIsYearly={setIsYearly} />
                </motion.div>

                {/* 3D Cards Grid with Perspective */}
                <div
                    className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                    style={{
                        perspective: isDesktop ? '1000px' : 'none',
                        transformStyle: 'preserve-3d'
                    }}
                >
                    {plans.map((plan, index) => {
                        const isPopular = index === 1;

                        return (
                            <PricingCard3D
                                key={plan.id}
                                plan={plan}
                                index={index}
                                isPopular={isPopular}
                                isYearly={isYearly}
                                inView={inView}
                                handleSubscribe={handleSubscribe}
                                formatCurrency={formatCurrency}
                                isLoading={isLoading}
                            />
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

// 3D Pricing Card Component
const PricingCard3D = ({ plan, index, isPopular, isYearly, inView, handleSubscribe, formatCurrency, isLoading }) => {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const { isDesktop } = useMediaQuery();

    // Mouse position for tilt effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring animations for smooth tilt
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
        stiffness: 300,
        damping: 20
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
        stiffness: 300,
        damping: 20
    });

    // Price counting animation
    const finalAmount = isYearly ? plan.price * 12 * 0.8 : plan.price;
    const displayPrice = useCountUp(finalAmount, 1500, inView);

    const handleMouseMove = (e) => {
        if (!cardRef.current || !isDesktop) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseXPos = (e.clientX - centerX) / (rect.width / 2);
        const mouseYPos = (e.clientY - centerY) / (rect.height / 2);

        mouseX.set(mouseXPos);
        mouseY.set(mouseYPos);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
    };

    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 800);
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50, rotateX: -15 }}
            animate={inView ? {
                opacity: 1,
                y: 0,
                rotateX: 0
            } : {}}
            transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut"
            }}
            style={{
                rotateX: isDesktop ? rotateX : 0,
                rotateY: isDesktop ? rotateY : 0,
                transformStyle: 'preserve-3d',
                scale: isClicked ? [1, 1.1, 0.98, 1.02, 1] : 1
            }}
            whileHover={isDesktop ? {
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
            } : {}}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className={`
                relative group cursor-pointer
                ${isPopular ? 'md:scale-105' : ''}
            `}
        >
            {/* 3D Card Shadow */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-2xl"
                style={{
                    transform: 'translateZ(-20px)',
                }}
            />

            {/* Main Card */}
            <div
                className={`
                    relative h-full bg-white/90 backdrop-blur-xl rounded-2xl p-8 overflow-hidden
                    ${isPopular ? 'border-2 border-primary-500 shadow-2xl' : 'border border-gray-200/50 shadow-lg'}
                `}
                style={{
                    boxShadow: isHovered
                        ? '0 30px 80px rgba(79,179,246,0.4), 0 0 1px rgba(0,0,0,0.1)'
                        : '0 20px 60px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)',
                    transformStyle: 'preserve-3d',
                    transition: 'box-shadow 0.3s ease'
                }}
            >
                {/* Most Popular Badge with 3D Float */}
                {isPopular && (
                    <motion.div
                        className="absolute top-0 right-0 bg-gradient-to-r from-secondary-500 to-orange-500 text-white px-4 py-2 rounded-bl-xl rounded-tr-xl text-sm font-bold shadow-lg"
                        style={{
                            transform: 'translateZ(80px)',
                            transformStyle: 'preserve-3d'
                        }}
                        animate={{
                            rotate: [0, 5, -5, 0],
                            y: [0, -5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        whileHover={{
                            y: -10,
                            rotate: 360,
                            transition: { duration: 0.6 }
                        }}
                    >
                        <motion.div
                            animate={{
                                boxShadow: [
                                    '0 0 20px rgba(255,107,53,0.5)',
                                    '0 0 40px rgba(255,107,53,0.8)',
                                    '0 0 20px rgba(255,107,53,0.5)'
                                ]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity
                            }}
                        >
                            Most Popular
                        </motion.div>
                    </motion.div>
                )}

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="text-center mb-8" style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                        {plan.description || 'Flexible creative solution'}
                    </p>

                    {/* Animated Price with Counting */}
                    <div className="flex items-baseline justify-center">
                        <motion.span
                            className="text-5xl font-bold text-gray-900"
                            animate={{
                                textShadow: isHovered
                                    ? ['0 0 0px rgba(79,179,246,0)', '0 0 20px rgba(79,179,246,0.6)', '0 0 0px rgba(79,179,246,0)']
                                    : '0 0 0px rgba(79,179,246,0)'
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity
                            }}
                        >
                            ₹{displayPrice.toLocaleString('en-IN')}
                        </motion.span>
                        <span className="text-gray-600 ml-2 text-sm">
                            /{isYearly ? 'year' : plan.duration}
                        </span>
                    </div>
                    {isYearly && (
                        <motion.p
                            className="text-green-600 text-sm font-semibold mt-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Save 20% with yearly billing
                        </motion.p>
                    )}
                </div>

                {/* Feature List with Stagger Animation */}
                <ul className="space-y-4 mb-8">
                    <FeatureItem delay={0} isHovered={isHovered}>
                        {plan.activeRequestLimit} Active Request{plan.activeRequestLimit > 1 ? 's' : ''} at a time
                    </FeatureItem>
                    <FeatureItem delay={0.05} isHovered={isHovered}>
                        {plan.monthlyGraphicsCredits} Graphics Credits
                    </FeatureItem>
                    <FeatureItem delay={0.1} isHovered={isHovered}>
                        {plan.monthlyVideoCredits} Video Credits
                    </FeatureItem>
                    <FeatureItem delay={0.15} isHovered={isHovered}>
                        Unlimited Revisions
                    </FeatureItem>
                    <FeatureItem delay={0.2} isHovered={isHovered}>
                        {plan.turnaroundHours}h Turnaround
                    </FeatureItem>
                    {plan.features && Object.entries(plan.features).slice(0, 1).map(([key, value]) => (
                        value && (
                            <FeatureItem key={key} delay={0.25} isHovered={isHovered}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </FeatureItem>
                        )
                    ))}
                </ul>

                {/* 3D CTA Button */}
                <motion.div
                    style={{
                        transform: 'translateZ(30px)',
                        transformStyle: 'preserve-3d'
                    }}
                    whileHover={{
                        scale: 1.05,
                        translateZ: 50
                    }}
                    whileTap={{
                        scale: 0.95,
                        translateZ: 0
                    }}
                >
                    <AnimatedButton
                        variant={isPopular ? 'primary' : 'outline'}
                        size="lg"
                        onClick={() => handleSubscribe(plan)}
                        className="w-full relative overflow-hidden"
                        loading={isLoading}
                    >
                        {/* Gradient Shimmer Effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                                x: ['-100%', '200%']
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                        <span className="relative z-10">
                            {isPopular ? 'Start Free Trial' : 'Get Started'}
                        </span>
                    </AnimatedButton>
                </motion.div>

                {isPopular && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                        No credit card required
                    </p>
                )}

                {/* Floating Particles on Hover */}
                {isHovered && (
                    <>
                        <motion.div
                            className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"
                            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full"
                            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                    </>
                )}
            </div>
        </motion.div>
    );
};

// Animated Feature Item Component
const FeatureItem = ({ children, delay, isHovered }) => {
    const [isItemHovered, setIsItemHovered] = useState(false);

    return (
        <motion.li
            className={`flex items-start min-h-[44px] transition-all duration-300 rounded-lg px-2 py-1 ${isItemHovered ? 'bg-primary-50 dark:bg-primary-900/20 translate-x-2' : ''
                }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.4 }}
            onMouseEnter={() => setIsItemHovered(true)}
            onMouseLeave={() => setIsItemHovered(false)}
        >
            <AnimatedCheckIcon isHovered={isItemHovered} />
            <span className="text-gray-700">{children}</span>
        </motion.li>
    );
};

// Animated Checkmark Icon with SVG Path Drawing
const AnimatedCheckIcon = ({ isHovered }) => {
    return (
        <motion.svg
            className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{
                scale: isHovered ? 1.2 : 1
            }}
            transition={{ duration: 0.2 }}
        >
            <motion.circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            />
            <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            />
        </motion.svg>
    );
};

export default Pricing;
