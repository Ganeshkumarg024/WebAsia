import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AnimatedButton from '../ui/AnimatedButton';

// Mascot Carousel Component
const MascotCarousel = ({ mousePosition }) => {
    const [currentMascot, setCurrentMascot] = useState(0);

    const mascots = [
        {
            src: '/assets/mascot.png',
            alt: 'WebAsia Superhero Mascot',
            name: 'Hero Mode'
        },
        {
            src: '/assets/mascot-flying.png',
            alt: 'WebAsia Flying Mascot',
            name: 'Flying Mode'
        },
        {
            src: '/assets/mascot-toolbox.png',
            alt: 'WebAsia Mascot with Toolbox',
            name: 'Builder Mode'
        },
        {
            src: '/assets/mascot-toolbox-wbg.png',
            alt: 'WebAsia Mascot with Toolbox (White BG)',
            name: 'Creator Mode'
        }
    ];

    // Auto-rotate mascots every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMascot((prev) => (prev + 1) % mascots.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative transition-transform duration-300">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMascot}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -20, 0],
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                        opacity: { duration: 0.5 },
                        scale: { duration: 0.5 },
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                        transform: `translateX(${mousePosition.x * 0.5}px) translateY(${mousePosition.y * 0.5}px)`
                    }}
                    className="relative"
                >
                    <img
                        src={mascots[currentMascot].src}
                        alt="WebAsia fox superhero mascot character"
                        className="w-full max-w-md lg:max-w-lg drop-shadow-2xl"
                        loading="eager"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Mascot Indicators */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                {mascots.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentMascot(index)}
                        className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-300 ${index === currentMascot
                                ? 'bg-primary-500 w-8'
                                : 'bg-gray-300 hover:bg-gray-400 w-2'
                            }`}
                        aria-label={`View ${mascots[index].name}`}
                    />
                ))}
            </div>
        </div>
    );
};

const Hero = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block mb-6"
                        >
                            <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-bold">
                                🎨 India's #1 Design Platform
                            </span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900"
                        >
                            Unlimited{' '}
                            <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                                Graphic Design
                            </span>{' '}
                            & Videos.{' '}
                            <span className="bg-gradient-to-r from-secondary-500 to-orange-500 bg-clip-text text-transparent">
                                Flat Fee.
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg leading-relaxed text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0"
                        >
                            Get unlimited design requests, unlimited revisions, and lightning-fast turnaround.
                            All for one flat monthly fee. No contracts, cancel anytime.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
                        >
                            <AnimatedButton
                                variant="primary"
                                size="lg"
                                onClick={() => window.location.href = '/register'}
                                className="w-full sm:w-auto"
                            >
                                Start Free Trial
                            </AnimatedButton>
                            <AnimatedButton
                                variant="outline"
                                size="lg"
                                onClick={() => scrollToSection('pricing')}
                                className="w-full sm:w-auto"
                            >
                                View Pricing
                            </AnimatedButton>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-6 lg:gap-8 justify-center lg:justify-start text-sm"
                        >
                            <div className="flex items-center gap-2 min-w-[44px] min-h-[44px]">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-gray-700">500+ Happy Clients</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-[44px] min-h-[44px]">
                                <div className="flex gap-0.5 flex-shrink-0" aria-label="4.9 out of 5 stars">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="font-semibold text-gray-700">4.9/5 Rating</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-[44px] min-h-[44px]">
                                <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-gray-700">24-Hour Delivery</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Mascot Carousel */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex items-center justify-center scale-100 md:scale-100 lg:scale-110"
                    >
                        <MascotCarousel mousePosition={mousePosition} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
