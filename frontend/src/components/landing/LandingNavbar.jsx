import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass shadow-lg py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/assets/mascot.png" alt="WebAsia" className="h-10 w-10" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                            WebAsia
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => scrollToSection('home')}
                            className="text-gray-700 hover:text-primary-500 transition-colors font-medium"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className="text-gray-700 hover:text-primary-500 transition-colors font-medium"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="text-gray-700 hover:text-primary-500 transition-colors font-medium"
                        >
                            Pricing
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="text-gray-700 hover:text-primary-500 transition-colors font-medium"
                        >
                            Contact
                        </button>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-gray-700 hover:text-primary-500 transition-colors font-medium"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="btn-primary px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-gray-700 hover:text-primary-500 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden mt-4 glass-card p-4 space-y-3"
                    >
                        <button
                            onClick={() => scrollToSection('home')}
                            className="block w-full text-left text-gray-700 hover:text-primary-500 transition-colors font-medium py-2"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className="block w-full text-left text-gray-700 hover:text-primary-500 transition-colors font-medium py-2"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="block w-full text-left text-gray-700 hover:text-primary-500 transition-colors font-medium py-2"
                        >
                            Pricing
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="block w-full text-left text-gray-700 hover:text-primary-500 transition-colors font-medium py-2"
                        >
                            Contact
                        </button>
                        <hr className="border-gray-200" />
                        <Link
                            to="/login"
                            className="block w-full text-left text-gray-700 hover:text-primary-500 transition-colors font-medium py-2"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="block w-full btn-primary text-center px-6 py-2.5 rounded-full"
                        >
                            Get Started
                        </Link>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
};

export default LandingNavbar;
