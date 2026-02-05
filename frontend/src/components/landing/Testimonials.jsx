import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import useTestimonialStore from '../../store/testimonialStore';
import useMediaQuery from '../../hooks/useMediaQuery';

const Testimonials = () => {
    const { publicTestimonials, fetchPublicTestimonials, isLoading } = useTestimonialStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const { isDesktop, isMobile } = useMediaQuery();

    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        fetchPublicTestimonials();
    }, []);

    // Combine real testimonials with placeholders if empty
    const displayTestimonials = publicTestimonials.length > 0 ? publicTestimonials : [
        {
            user: { firstName: 'Rajesh', lastName: 'Kumar', photoUrl: null },
            content: 'WebAsia transformed our brand identity completely. The unlimited revisions meant we got exactly what we wanted. Best investment we\'ve made!',
            rating: 5,
        },
        {
            user: { firstName: 'Priya', lastName: 'Sharma', photoUrl: null },
            content: 'The turnaround time is incredible! We get professional designs in 24-48 hours. Our social media has never looked better.',
            rating: 5,
        },
        {
            user: { firstName: 'Amit', lastName: 'Patel', photoUrl: null },
            content: 'Having a dedicated designer who understands our brand has been game-changing. The flat monthly fee saves us thousands compared to hiring.',
            rating: 5,
        },
    ];

    // Auto-rotate testimonials
    useEffect(() => {
        if (isMobile) return; // No auto-rotate on mobile

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [displayTestimonials.length, isMobile]);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
    };

    return (
        <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
            {/* 3D Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Trusted by{' '}
                        <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                            Indian Businesses
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        See what our clients have to say about their experience with WebAsia
                    </p>
                </motion.div>

                {/* Desktop: 3D Stack View */}
                {isDesktop && (
                    <div className="relative max-w-4xl mx-auto" style={{ perspective: '1500px', minHeight: '400px' }}>
                        <AnimatePresence mode="wait">
                            {displayTestimonials.map((testimonial, index) => {
                                const offset = index - currentIndex;
                                const isActive = index === currentIndex;

                                return (
                                    <motion.div
                                        key={index}
                                        className="absolute inset-0"
                                        initial={{
                                            opacity: 0,
                                            rotateY: offset > 0 ? 90 : -90,
                                            x: offset > 0 ? '100%' : '-100%',
                                            scale: 0.8
                                        }}
                                        animate={{
                                            opacity: isActive ? 1 : 0.7,
                                            rotateY: offset * 15,
                                            x: offset * 100,
                                            z: isActive ? 0 : -200 * Math.abs(offset),
                                            scale: isActive ? 1 : 0.85,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            rotateY: offset > 0 ? -90 : 90,
                                            x: offset > 0 ? '-100%' : '100%',
                                            scale: 0.8
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            pointerEvents: isActive ? 'auto' : 'none'
                                        }}
                                    >
                                        <TestimonialCard3D testimonial={testimonial} isActive={isActive} />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <motion.button
                            onClick={prevTestimonial}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-xl hover:shadow-2xl z-20"
                            whileHover={{
                                scale: 1.1,
                                x: -5,
                                rotate: -15
                            }}
                            whileTap={{ scale: 0.9 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </motion.button>

                        <motion.button
                            onClick={nextTestimonial}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-xl hover:shadow-2xl z-20"
                            whileHover={{
                                scale: 1.1,
                                x: 5,
                                rotate: 15
                            }}
                            whileTap={{ scale: 0.9 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>

                        {/* Indicator Dots */}
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3">
                            {displayTestimonials.map((_, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`rounded-full transition-all ${index === currentIndex
                                            ? 'bg-primary-500 w-8 h-3'
                                            : 'bg-gray-300 w-3 h-3 hover:bg-gray-400'
                                        }`}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    animate={{
                                        scale: index === currentIndex ? [1, 1.2, 1] : 1
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: index === currentIndex ? Infinity : 0,
                                        repeatDelay: 2
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile/Tablet: Grid View */}
                {!isDesktop && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {displayTestimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                            >
                                <TestimonialCard3D testimonial={testimonial} isActive={true} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

// 3D Testimonial Card Component
const TestimonialCard3D = ({ testimonial, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { isDesktop } = useMediaQuery();

    // Split content into words for animation
    const words = testimonial.content.split(' ');

    return (
        <motion.div
            className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-xl h-full flex flex-col"
            style={{
                transformStyle: 'preserve-3d',
                boxShadow: isHovered
                    ? '0 40px 100px rgba(139,92,246,0.3)'
                    : '0 20px 60px rgba(139,92,246,0.1)'
            }}
            whileHover={isDesktop ? {
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
            } : {}}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Layers for Depth */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ transform: 'translateZ(-20px)' }}
            />

            {/* Star Rating with 3D Pop */}
            <div className="flex items-center mb-4" style={{ transform: 'translateZ(30px)' }}>
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <motion.svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                            scale: isActive ? 1 : 0,
                            rotate: isActive ? 0 : -180
                        }}
                        transition={{
                            duration: 0.4,
                            delay: i * 0.08,
                            type: "spring",
                            stiffness: 300
                        }}
                        whileHover={{
                            scale: 1.3,
                            rotate: 360,
                            transition: { duration: 0.3 }
                        }}
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                ))}
            </div>

            {/* Quote Text with Word-by-Word Animation */}
            <p className="text-gray-700 mb-8 leading-relaxed italic text-lg flex-1" style={{ transform: 'translateZ(10px)' }}>
                <span className="text-4xl text-purple-300 leading-none">"</span>
                {words.map((word, index) => (
                    <motion.span
                        key={index}
                        className="inline-block mr-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                            opacity: isActive ? 1 : 0,
                            y: isActive ? 0 : 10
                        }}
                        transition={{
                            duration: 0.3,
                            delay: index * 0.03
                        }}
                    >
                        {word}
                    </motion.span>
                ))}
                <span className="text-4xl text-purple-300 leading-none">"</span>
            </p>

            {/* Avatar and User Info with 3D Hover */}
            <motion.div
                className="flex items-center gap-4 mt-auto"
                style={{ transform: 'translateZ(40px)' }}
            >
                <motion.div
                    whileHover={{
                        scale: 1.2,
                        rotate: [0, -5, 5, -5, 0],
                        transition: { duration: 0.5 }
                    }}
                    className="relative"
                >
                    {testimonial.user?.photoUrl ? (
                        <img
                            src={testimonial.user.photoUrl}
                            alt={testimonial.user.firstName}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-100"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-purple-100">
                            {(testimonial.user?.firstName?.[0] || 'U')}
                        </div>
                    )}

                    {/* Ring Animation on Hover */}
                    {isHovered && (
                        <motion.div
                            className="absolute inset-0 rounded-2xl border-2 border-purple-400"
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    )}
                </motion.div>

                <motion.div
                    animate={{
                        y: isHovered ? -5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <h4 className="font-black text-gray-900 leading-none mb-1">
                        {testimonial.user?.firstName} {testimonial.user?.lastName}
                    </h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {testimonial.serviceType || 'Client'}
                    </p>
                </motion.div>
            </motion.div>

            {/* Decorative Quote Icon */}
            <div
                className="absolute top-8 right-8 text-purple-200 opacity-10"
                style={{ transform: 'translateZ(30px)' }}
            >
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
            </div>
        </motion.div>
    );
};

export default Testimonials;
