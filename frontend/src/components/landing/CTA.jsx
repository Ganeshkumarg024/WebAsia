import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';

const CTA = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section id="cta" className="py-20 gradient-blue relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Ready to Scale Your Design?
                    </h2>
                    <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Join 500+ businesses who trust WebAsia for unlimited, high-quality designs at a flat monthly rate.
                    </p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            to="/register"
                            className="bg-white text-primary-600 px-10 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                        >
                            Start Your Free Trial
                        </Link>
                        <button
                            onClick={() => {
                                const element = document.getElementById('pricing');
                                if (element) element.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transform hover:scale-105 transition-all"
                        >
                            View Pricing
                        </button>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-white/80 mt-6"
                    >
                        No credit card required • Cancel anytime • 14-day money-back guarantee
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
};

export default CTA;
