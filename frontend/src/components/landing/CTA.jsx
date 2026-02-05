import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import AnimatedButton from '../ui/AnimatedButton';
import ParticleSystem from '../3d/ParticleSystem';
import AnimatedGrid from '../3d/AnimatedGrid';
import FloatingShapes from '../3d/FloatingShapes';
import useMediaQuery from '../../hooks/useMediaQuery';

const CTA = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });
    const { isDesktop } = useMediaQuery();

    const titleWords = ['Ready', 'to', 'Scale', 'Your', 'Design?'];

    return (
        <section className="py-20 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 relative overflow-hidden">
            {/* 3D Particle Background */}
            <ParticleSystem
                particleCount={1000}
                colors={['#ffffff', '#00D9FF', '#8B5CF6', '#4FB3F6']}
                mouseInteraction="attract"
                speed={0.8}
            />

            {/* Animated 3D Grid */}
            <AnimatedGrid />

            {/* Floating 3D Shapes */}
            <FloatingShapes count={6} />

            {/* Static decorative elements (fallback for mobile) */}
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
                    {/* Title with 3D Pop Animation */}
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {titleWords.map((word, index) => (
                            <motion.span
                                key={index}
                                className="inline-block mr-3"
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotateX: -90,
                                    z: -100
                                }}
                                animate={inView ? {
                                    opacity: 1,
                                    scale: [0.5, 1.2, 1],
                                    rotateX: 0,
                                    z: 0
                                } : {}}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.15,
                                    type: "spring",
                                    stiffness: 200
                                }}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    textShadow: '0 4px 30px rgba(0,0,0,0.3)'
                                }}
                            >
                                <motion.span
                                    animate={{
                                        textShadow: [
                                            '0 0 20px rgba(255,255,255,0.5)',
                                            '0 0 40px rgba(255,255,255,0.8)',
                                            '0 0 20px rgba(255,255,255,0.5)'
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: index * 0.2
                                    }}
                                >
                                    {word}
                                </motion.span>
                            </motion.span>
                        ))}
                    </h2>

                    <motion.p
                        className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        Join 500+ businesses that trust WebAsia for their design needs. Start your free trial today.
                    </motion.p>

                    {/* 3D CTA Button with Multi-Layer Effect */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.6, delay: 1 }}
                    >
                        <motion.div
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: 'translateZ(60px)'
                            }}
                            animate={{
                                y: [0, -10, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            whileHover={isDesktop ? {
                                scale: 1.15,
                                z: 100,
                                transition: { duration: 0.3 }
                            } : {}}
                            whileTap={{
                                scale: 0.95,
                                z: 40
                            }}
                            className="relative"
                        >
                            {/* Button Glow Effect */}
                            <motion.div
                                className="absolute inset-0 bg-white rounded-full blur-2xl opacity-50"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity
                                }}
                            />

                            {/* Magnetic Field Rings */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-white/30"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 0, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity
                                }}
                            />

                            <AnimatedButton
                                variant="primary"
                                size="lg"
                                onClick={() => window.location.href = '/register'}
                                className="bg-white text-primary-600 hover:bg-gray-50 w-full sm:w-auto px-12 relative overflow-hidden shadow-2xl"
                            >
                                {/* Gradient Shimmer Effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-200/50 to-transparent"
                                    animate={{
                                        x: ['-200%', '200%']
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />

                                {/* Button Content */}
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Free Trial
                                    <motion.svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        animate={{
                                            x: [0, 5, 0]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </motion.svg>
                                </span>
                            </AnimatedButton>
                        </motion.div>
                    </motion.div>

                    {/* Trust Badges with 3D Animation */}
                    <motion.div
                        className="flex flex-wrap gap-6 justify-center text-white/80 text-sm"
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6, delay: 1.2 }}
                    >
                        {[
                            { icon: '✓', text: 'No credit card required' },
                            { icon: '✓', text: 'Cancel anytime' },
                            { icon: '✓', text: '14-day money-back guarantee' }
                        ].map((badge, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, y: 50 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: 1.4 + index * 0.1,
                                    type: "spring",
                                    stiffness: 200
                                }}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: 'translateZ(20px)'
                                }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.05,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <motion.span
                                    className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold"
                                    animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: 1.4 + index * 0.1
                                    }}
                                    whileHover={{
                                        scale: 1.3,
                                        rotate: 360,
                                        transition: { duration: 0.5 }
                                    }}
                                >
                                    {badge.icon}
                                </motion.span>
                                <span>{badge.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTA;
