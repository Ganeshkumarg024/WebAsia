import { useState, useEffect } from 'react';

/**
 * Custom hook to detect device type and adjust animation complexity
 * @returns {object} Device type flags and breakpoint info
 */
const useMediaQuery = () => {
    const [deviceType, setDeviceType] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: typeof window !== 'undefined' ? window.innerWidth : 1920
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setDeviceType({
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
                width
            });
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return deviceType;
};

export default useMediaQuery;
