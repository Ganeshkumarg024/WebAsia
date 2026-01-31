import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import Benefits from '../components/landing/Benefits';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen">
            <LandingNavbar />
            <Hero />
            <Benefits />
            <Features />
            <Pricing />
            <Testimonials />
            <CTA />
            <Footer />
        </div>
    );
};

export default LandingPage;
