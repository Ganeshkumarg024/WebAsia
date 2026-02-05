import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import AnimatedCard from '../ui/AnimatedCard';
import IconWrapper from '../ui/IconWrapper';

const Features = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const features = [
        {
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            title: 'Brand-Focused Process',
            description: 'Every design is crafted with your brand identity in mind, ensuring consistency across all touchpoints and platforms.',
            variant: 'primary'
        },
        {
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            title: 'Expert Designers',
            description: 'Our team consists of seasoned professionals with years of experience in creating stunning visuals for businesses.',
            variant: 'secondary'
        },
        {
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            title: 'AI-Powered Tools',
            description: 'Leverage cutting-edge AI technology to streamline workflows and deliver exceptional results faster than ever.',
            variant: 'accent'
        },
    ];

    return (
        <section id="features" className="py-20 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-900">
                        Experience{' '}
                        <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                            Seamless Design
                        </span>
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto">
                        Our streamlined process ensures you get professional designs without the hassle
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8" style={{ gridAutoRows: '1fr' }}>
                    {features.map((feature, index) => (
                        <AnimatedCard
                            key={index}
                            delay={index * 0.15}
                            className="text-center group"
                        >
                            <IconWrapper variant={feature.variant} size="lg" className="mb-6 mx-auto">
                                {feature.icon}
                            </IconWrapper>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-primary-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-base leading-relaxed text-gray-600 mb-6">
                                {feature.description}
                            </p>
                            <button className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 mx-auto group-hover:gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary-300 rounded px-2 py-1">
                                Learn More
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </AnimatedCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
