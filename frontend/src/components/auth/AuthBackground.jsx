import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * 3D Animated Background for Authentication Pages
 * Features: Particle system, gradient orbs, geometric shapes, grid overlay
 * Optimized for split-screen auth layout
 */
const AuthBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height;
                this.opacity = Math.random() * 0.4 + 0.1; // Lighter opacity
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = -10;
                this.size = Math.random() * 2.5 + 0.5; // Smaller particles
                this.speedY = Math.random() * 0.3 + 0.1; // Slower movement
                this.speedX = Math.random() * 0.2 - 0.1;
                this.opacity = Math.random() * 0.4 + 0.1;

                // Blue/purple color palette for auth pages
                const colors = [
                    'rgba(59, 130, 246,',  // Blue
                    'rgba(79, 179, 246,',  // Light Blue
                    'rgba(139, 92, 246,',  // Purple
                    'rgba(99, 102, 241,',  // Indigo
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;

                // Reset particle when it goes off screen
                if (this.y > canvas.height) {
                    this.reset();
                }

                // Wrap around horizontally
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `${this.color} ${this.opacity})`;
                ctx.fill();
            }
        }

        // Create particles (fewer than landing page for calmer effect)
        const particleCount = 80;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections between nearby particles
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.08 * (1 - distance / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            {/* Canvas for particles */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: 0.5 }}
            />

            {/* Animated gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute w-96 h-96 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                    animate={{
                        x: ['-10%', '110%'],
                        y: ['10%', '90%'],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                    }}
                />

                <motion.div
                    className="absolute w-96 h-96 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                    animate={{
                        x: ['110%', '-10%'],
                        y: ['90%', '10%'],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                    }}
                />

                <motion.div
                    className="absolute w-80 h-80 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(79, 179, 246, 0.12) 0%, transparent 70%)',
                        filter: 'blur(70px)',
                    }}
                    animate={{
                        x: ['50%', '50%'],
                        y: ['-10%', '110%'],
                    }}
                    transition={{
                        duration: 28,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Geometric shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            width: Math.random() * 80 + 40,
                            height: Math.random() * 80 + 40,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: `linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))`,
                            borderRadius: Math.random() > 0.5 ? '50%' : '20%',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                        }}
                        animate={{
                            y: [0, -25, 0],
                            x: [0, Math.random() * 15 - 7.5, 0],
                            rotate: [0, 360],
                            scale: [1, 1.08, 1],
                        }}
                        transition={{
                            duration: Math.random() * 12 + 12,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(59, 130, 246, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                }}
            />
        </>
    );
};

export default AuthBackground;
