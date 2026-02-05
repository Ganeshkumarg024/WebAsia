import { useState, useEffect } from 'react';

/**
 * Custom hook for animated number counting
 * @param {number} end - Target number to count to
 * @param {number} duration - Animation duration in milliseconds
 * @param {boolean} start - Trigger to start counting
 * @returns {number} Current count value
 */
const useCountUp = (end, duration = 1500, start = false) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!start) return;

        let startTime = null;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [end, duration, start]);

    return count;
};

export default useCountUp;
