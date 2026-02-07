import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import Benefits from '../components/landing/Benefits';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';
import AnimatedBackground from '../components/landing/AnimatedBackground';

const LandingPage = () => {
    return (
        <div className="min-h-screen relative">
            {/* Global Animated Background */}
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <LandingNavbar />
                <Hero />
                <Benefits />
                <Features />
                <Pricing />
                <Testimonials />
                <CTA />
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
