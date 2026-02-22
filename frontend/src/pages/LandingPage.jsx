import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    const [searchParams] = useSearchParams();

    // Capture affiliate referral code from URL (?ref=WA-XXXXX)
    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            localStorage.setItem('wa_referral', JSON.stringify({
                code: refCode,
                expiry: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
            }));
            console.log('Referral code captured:', refCode);
        }
    }, [searchParams]);

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
