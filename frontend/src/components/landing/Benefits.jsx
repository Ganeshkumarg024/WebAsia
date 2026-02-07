import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import AnimatedCard from '../ui/AnimatedCard';
import IconWrapper from '../ui/IconWrapper';

const Benefits = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const benefits = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Perfect Designs, Every Time',
            description: 'Our expert designers ensure pixel-perfect quality in every project, tailored to your brand identity.',
            variant: 'primary'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: '24-Hour Turnaround Guaranteed',
            description: 'Get your designs delivered within 24-48 hours. No more waiting weeks for results.',
            variant: 'secondary'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: 'Dedicated Designer Team',
            description: 'Work with the same expert designers who understand your brand and style preferences.',
            variant: 'accent'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Fixed Monthly Pricing',
            description: 'One flat fee for unlimited designs. No surprises, no hidden costs, complete transparency.',
            variant: 'green'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            ),
            title: 'Unlimited Revisions',
            description: 'Get as many revisions as you need until you\'re 100% satisfied with the final design.',
            variant: 'blue'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            title: 'All Design Types Covered',
            description: 'From logos to social media graphics, videos, presentations, and everything in between.',
            variant: 'orange'
        },
    ];

    return (
        <section id="benefits" className="py-20 bg-white/80 backdrop-blur-sm relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4 text-gray-900">
                        Discover WebAsia's{' '}
                        <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            Key Benefits
                        </span>
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto">
                        Everything you need to scale your design needs without breaking the bank
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ gridAutoRows: '1fr' }}>
                    {benefits.map((benefit, index) => (
                        <AnimatedCard
                            key={index}
                            delay={index * 0.1}
                            className="group"
                        >
                            <IconWrapper variant={benefit.variant} size="md" className="mb-6">
                                {benefit.icon}
                            </IconWrapper>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors">
                                {benefit.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {benefit.description}
                            </p>
                        </AnimatedCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Benefits;
