import { motion } from 'framer-motion';
import useMediaQuery from '../../hooks/useMediaQuery';

/**
 * 3D grid background with perspective and neon glow effects
 */
const AnimatedGrid = () => {
    const { isMobile } = useMediaQuery();

    // Simplified version for mobile
    if (isMobile) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ perspective: '1200px' }}>
            <motion.div
                className="absolute inset-0"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(60deg) translateZ(-200px)'
                }}
                animate={{
                    rotateZ: [0, 360]
                }}
                transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            >
                {/* Horizontal lines */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-px"
                        style={{
                            top: `${i * 5}%`,
                            background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.3), transparent)',
                            boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
                        }}
                        animate={{
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: 'easeInOut'
                        }}
                    />
                ))}

                {/* Vertical lines */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-px"
                        style={{
                            left: `${i * 5}%`,
                            background: 'linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
                            boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                        }}
                        animate={{
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: 'easeInOut'
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default AnimatedGrid;
