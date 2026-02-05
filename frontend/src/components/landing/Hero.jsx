import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

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

    // Generate particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        delay: Math.random() * 20
    }));

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* 3D Gradient Mesh Background */}
            <div className="absolute inset-0 gradient-mesh opacity-60"></div>

            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-40 right-10 w-96 h-96 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            {/* Floating Particles */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: `${particle.left}%`,
                        animationDelay: `${particle.delay}s`
                    }}
                />
            ))}

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block mb-6"
                        >
                            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-3d shimmer">
                                🎨 India's #1 Design Platform
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                            style={{
                                textShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}
                        >
                            Unlimited{' '}
                            <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 bg-clip-text text-transparent animate-pulse-3d">
                                Graphic Design
                            </span>{' '}
                            & Videos.{' '}
                            <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                                Flat Fee.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Get unlimited design requests, unlimited revisions, and lightning-fast turnaround.
                            All for one flat monthly fee. No contracts, cancel anytime.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
                        >
                            <Link
                                to="/register"
                                className="group relative btn-primary px-8 py-4 rounded-full text-lg font-semibold shadow-3d hover:shadow-3d-lg transform hover:scale-105 transition-all overflow-hidden"
                            >
                                <span className="relative z-10">Get Started Free</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                            <button
                                onClick={() => scrollToSection('pricing')}
                                className="glass-card-3d px-8 py-4 rounded-full text-lg font-semibold text-primary-600 hover:text-primary-700 transform hover:scale-105 transition-all"
                            >
                                View Pricing
                            </button>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-8 justify-center lg:justify-start text-sm"
                        >
                            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-gray-700">500+ Happy Clients</span>
                            </div>
                            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold text-gray-700">4.9/5 Rating</span>
                            </div>
                            <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-gray-700">24-48hr Delivery</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - 3D Mascot */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex items-center justify-center perspective-container"
                    >
                        {/* Main Mascot with 3D Float */}
                        <motion.div
                            animate={{
                                y: [0, -30, 0],
                                rotateY: [0, 5, 0],
                                rotateX: [0, 5, 0]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                transform: `translateX(${mousePosition.x}px) translateY(${mousePosition.y}px)`
                            }}
                            className="relative z-10 transition-transform duration-300"
                        >
                            <div className="relative">
                                <img
                                    src="/assets/mascot.png"
                                    alt="WebAsia Superhero Mascot"
                                    className="w-full max-w-md lg:max-w-lg drop-shadow-2xl"
                                    style={{
                                        filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))'
                                    }}
                                />
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 opacity-20 blur-3xl -z-10"></div>
                            </div>
                        </motion.div>

                        {/* Floating 3D Cards */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotateZ: [0, 5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute top-10 right-0 lg:right-10 glass-card-3d p-6 rounded-3xl shadow-3d max-w-[200px]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">Fast Delivery</p>
                                    <p className="text-sm text-gray-600">24-48 hours</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{
                                y: [0, 20, 0],
                                rotateZ: [0, -5, 0]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                            className="absolute bottom-10 left-0 lg:left-10 glass-card-3d p-6 rounded-3xl shadow-3d max-w-[220px]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-secondary-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">Unlimited</p>
                                    <p className="text-sm text-gray-600">Revisions</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative 3D Elements */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/4 left-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl opacity-20 blur-sm"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-1/4 right-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-sm"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="glass-card p-3 rounded-full"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
