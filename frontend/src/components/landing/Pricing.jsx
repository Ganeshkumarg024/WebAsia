import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';

const Pricing = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const plans = [
        {
            name: 'Basic',
            price: '₹29,999',
            period: '/month',
            description: 'Perfect for startups and small businesses',
            features: [
                'One request at a time',
                'Unlimited revisions',
                '24-48 hour delivery',
                'All design types',
                'Dedicated designer',
                'Pause or cancel anytime',
            ],
            cta: 'Get Started',
            popular: false,
        },
        {
            name: 'Professional',
            price: '₹49,999',
            period: '/month',
            description: 'Ideal for growing businesses',
            features: [
                'Two requests at a time',
                'Unlimited revisions',
                '24-48 hour delivery',
                'All design types',
                'Dedicated designer',
                'Priority support',
                'Video editing included',
                'Pause or cancel anytime',
            ],
            cta: 'Get Started',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For large teams and agencies',
            features: [
                'Unlimited requests',
                'Unlimited revisions',
                '12-24 hour delivery',
                'All design types',
                'Multiple designers',
                'Priority support',
                'Video editing included',
                'Account manager',
                'Custom workflows',
            ],
            cta: 'Contact Sales',
            popular: false,
        },
    ];

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
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className={`relative glass-card p-8 ${plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-gray-600 mb-4">{plan.description}</p>
                                <div className="flex items-baseline justify-center">
                                    <span className="text-5xl font-bold text-gray-900">
                                        {plan.price}
                                    </span>
                                    <span className="text-gray-600 ml-2">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <svg
                                            className="w-6 h-6 text-green-500 mr-3 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/register"
                                className={`block w-full text-center py-3 rounded-full font-semibold transition-all ${plan.popular
                                        ? 'btn-primary shadow-lg hover:shadow-xl'
                                        : 'btn-outline bg-white hover:bg-primary-50'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
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

export default Pricing;
