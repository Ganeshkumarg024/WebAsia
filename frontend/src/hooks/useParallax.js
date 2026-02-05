import { useState, useEffect } from 'react';

/**
 * Custom hook for scroll-based parallax effects
 * @param {number} speed - Parallax speed multiplier (0.5 = slower, 2 = faster)
 * @returns {number} Transform value based on scroll position
 */
const useParallax = (speed = 1) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            setOffset(scrolled * speed);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
};

export default useParallax;
