import { motion } from 'framer-motion';
import useMediaQuery from '../../hooks/useMediaQuery';

/**
 * Abstract 3D floating shapes (cubes, spheres, toruses) with wireframe style
 */
const FloatingShapes = ({ count = 6 }) => {
    const { isMobile } = useMediaQuery();

    // Simplified version for mobile
    if (isMobile) return null;

    const shapes = Array.from({ length: count }, (_, i) => ({
        type: ['cube', 'sphere', 'torus'][i % 3],
        color: ['#4FB3F6', '#FF6B35', '#8B5CF6', '#00D9FF'][i % 4],
        size: 60 + Math.random() * 40,
        left: `${15 + i * 15}%`,
        top: `${20 + (i % 3) * 25}%`,
        delay: i * 0.5,
        duration: 10 + i * 2
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {shapes.map((shape, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        left: shape.left,
                        top: shape.top,
                        transformStyle: 'preserve-3d'
                    }}
                    animate={{
                        y: [0, -50, 0],
                        rotateX: [0, 360],
                        rotateY: [0, 360],
                        rotateZ: [0, 180],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: shape.duration,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: shape.delay
                    }}
                >
                    {shape.type === 'cube' && (
                        <div
                            className="relative"
                            style={{
                                width: shape.size,
                                height: shape.size,
                                transformStyle: 'preserve-3d',
                                transform: 'rotateX(45deg) rotateY(45deg)'
                            }}
                        >
                            {/* Cube faces */}
                            {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face, idx) => (
                                <div
                                    key={face}
                                    className="absolute inset-0 border-2 opacity-30"
                                    style={{
                                        borderColor: shape.color,
                                        boxShadow: `0 0 20px ${shape.color}`,
                                        transform:
                                            face === 'front' ? `translateZ(${shape.size / 2}px)` :
                                                face === 'back' ? `translateZ(-${shape.size / 2}px) rotateY(180deg)` :
                                                    face === 'right' ? `rotateY(90deg) translateZ(${shape.size / 2}px)` :
                                                        face === 'left' ? `rotateY(-90deg) translateZ(${shape.size / 2}px)` :
                                                            face === 'top' ? `rotateX(90deg) translateZ(${shape.size / 2}px)` :
                                                                `rotateX(-90deg) translateZ(${shape.size / 2}px)`
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {shape.type === 'sphere' && (
                        <div
                            className="rounded-full border-2 opacity-30"
                            style={{
                                width: shape.size,
                                height: shape.size,
                                borderColor: shape.color,
                                boxShadow: `0 0 30px ${shape.color}, inset 0 0 30px ${shape.color}`
                            }}
                        >
                            {/* Sphere rings */}
                            {[0, 30, 60].map((rotation) => (
                                <div
                                    key={rotation}
                                    className="absolute inset-0 rounded-full border opacity-50"
                                    style={{
                                        borderColor: shape.color,
                                        transform: `rotateY(${rotation}deg) rotateX(60deg)`
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {shape.type === 'torus' && (
                        <div className="relative" style={{ width: shape.size, height: shape.size }}>
                            {/* Torus rings */}
                            {[0, 1, 2, 3].map((ring) => (
                                <div
                                    key={ring}
                                    className="absolute inset-0 rounded-full border-2 opacity-20"
                                    style={{
                                        borderColor: shape.color,
                                        boxShadow: `0 0 20px ${shape.color}`,
                                        transform: `scale(${1 - ring * 0.15}) rotateX(${ring * 20}deg)`,
                                        margin: `${ring * 5}px`
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingShapes;
