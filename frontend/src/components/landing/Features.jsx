import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Features = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const features = [
        {
            title: 'Simple Request Process',
            description: 'Submit your design requests through our intuitive dashboard. Add as many requests as you need to your queue.',
            image: '🎯',
        },
        {
            title: 'Expert Designers',
            description: 'Your dedicated designer gets to work immediately. Receive your first draft within 24-48 hours.',
            image: '👨‍🎨',
        },
        {
            title: 'Unlimited Revisions',
            description: 'Request changes until you\'re completely satisfied. We\'ll keep refining until it\'s perfect.',
            image: '🔄',
        },
    ];

    const designTypes = [
        'Social Media Graphics',
        'Logo Design',
        'Brand Identity',
        'Marketing Materials',
        'Presentations',
        'Video Editing',
        'Illustrations',
        'Web Graphics',
        'Print Design',
        'Packaging Design',
        'Infographics',
        'And Much More...',
    ];

    return (
        <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* How It Works */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Experience{' '}
                        <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                            Seamless Design
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Our streamlined process makes getting professional designs easier than ever
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="text-center"
                        >
                            <div className="text-7xl mb-6">{feature.image}</div>
                            <div className="glass-card p-6">
                                <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                    {index + 1}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Design Types */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center"
                >
                    <h3 className="text-3xl sm:text-4xl font-bold mb-8">
                        Design{' '}
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                            Without Boundaries
                        </span>
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                        {designTypes.map((type, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={inView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.4, delay: 0.8 + index * 0.05 }}
                                className="glass-card px-6 py-3 rounded-full text-gray-700 font-medium hover:scale-105 transition-transform cursor-default"
                            >
                                {type}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
