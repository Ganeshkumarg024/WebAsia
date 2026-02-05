import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import AnimatedButton from '../ui/AnimatedButton';

const CTA = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Scale Your Design?
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join 500+ businesses that trust WebAsia for their design needs. Start your free trial today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <AnimatedButton
                            variant="primary"
                            size="lg"
                            onClick={() => window.location.href = '/register'}
                            className="bg-white text-primary-600 hover:bg-gray-50 w-full sm:w-auto px-12"
                        >
                            Start Free Trial
                        </AnimatedButton>
                    </div>

                    <p className="text-white/80 text-sm mt-6">
                        No credit card required • Cancel anytime • 14-day money-back guarantee
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default CTA;
