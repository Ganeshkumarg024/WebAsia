import { useEffect, useRef } from 'react';
import useMediaQuery from '../../hooks/useMediaQuery';

/**
 * Canvas-based particle system for immersive 3D backgrounds
 * Features mouse interaction, 3D depth, and responsive particle count
 */
const ParticleSystem = ({
    particleCount = 1000,
    colors = ['#ffffff', '#00D9FF', '#8B5CF6', '#4FB3F6'],
    mouseInteraction = 'repel', // 'repel' | 'attract' | 'none'
    speed = 1
}) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef(null);
    const { isMobile, isTablet, isDesktop } = useMediaQuery();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Responsive particle count
        let actualParticleCount = particleCount;
        if (isMobile) actualParticleCount = 0; // No particles on mobile
        else if (isTablet) actualParticleCount = Math.min(300, particleCount);

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Initialize particles
        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * 500 - 250; // -250 to 250 for depth
                this.vx = (Math.random() - 0.5) * speed;
                this.vy = (Math.random() - 0.5) * speed - 0.5; // Slight upward drift
                this.vz = (Math.random() - 0.5) * speed * 0.5;
                this.size = Math.random() * 6 + 2;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.3;
            }

            update() {
                // Mouse interaction
                if (mouseInteraction !== 'none') {
                    const dx = mouseRef.current.x - this.x;
                    const dy = mouseRef.current.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const maxDistance = 150;

                    if (distance < maxDistance) {
                        const force = (maxDistance - distance) / maxDistance;
                        const angle = Math.atan2(dy, dx);

                        if (mouseInteraction === 'repel') {
                            this.vx -= Math.cos(angle) * force * 2;
                            this.vy -= Math.sin(angle) * force * 2;
                        } else if (mouseInteraction === 'attract') {
                            this.vx += Math.cos(angle) * force * 0.5;
                            this.vy += Math.sin(angle) * force * 0.5;
                        }
                    }
                }

                // Update position
                this.x += this.vx;
                this.y += this.vy;
                this.z += this.vz;

                // Apply friction
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.vz *= 0.98;

                // Wrap around edges
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
                if (this.z < -250) this.z = 250;
                if (this.z > 250) this.z = -250;
            }

            draw() {
                // Calculate size based on depth (z-position)
                const scale = 1 + (this.z / 500); // 0.5 to 1.5
                const size = this.size * scale;
                const opacity = this.opacity * scale;

                ctx.beginPath();
                ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = opacity;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // Create particles
        particlesRef.current = Array.from({ length: actualParticleCount }, () => new Particle());

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY
            };
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Sort particles by z-index for proper depth rendering
            particlesRef.current.sort((a, b) => a.z - b.z);

            particlesRef.current.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (actualParticleCount > 0) {
            animate();
        }

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [particleCount, colors, mouseInteraction, speed, isMobile, isTablet, isDesktop]);

    // Don't render canvas on mobile
    if (isMobile) return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
};

export default ParticleSystem;
