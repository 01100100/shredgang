import React, { useEffect } from 'react';
import { throttle } from 'lodash';

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
    life: number;
    maxLife: number;
};

type ParticleBackgroundProps = {
    children: React.ReactNode;
};

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ children }) => {
    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const particles: Particle[] = [];
        const maxParticles = 300;
        const colors = ['hsl(0, 100%, 50%)', 'hsl(60, 100%, 50%)', 'hsl(120, 100%, 50%)', 'hsl(180, 100%, 50%)', 'hsl(240, 100%, 50%)', 'hsl(300, 100%, 50%)']; // Rainbow colors
        let hue = 0; // For dynamic color shifting

        const dpr = window.devicePixelRatio || 1;
        const resizeCanvas = () => {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();
        const throttledResize = throttle(resizeCanvas, 100);
        window.addEventListener('resize', throttledResize);

        // Mouse interaction variables
        const mouse = { x: null as number | null, y: null as number | null };
        const mouseRadius = 100;

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Create a single particle with random properties
        const createParticle = (): Particle => {
            const size = Math.random() * 2; // Size between 0 and 2
            return {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 1.5, // Velocity between -0.75 and 0.75
                vy: (Math.random() - 0.5) * 1.5,
                size,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.5, // Opacity between 0.5 and 1
                life: 0,
                maxLife: Math.random() * 100 + 50, // Life between 50 and 150 frames
            };
        };

        // Initialize particles
        const initParticles = () => {
            for (let i = 0; i < maxParticles; i++) {
                particles.push(createParticle());
            }
        };

        // Update particle positions and properties
        const updateParticles = () => {
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life += 1;

                // Wrap around the screen
                if (p.x > window.innerWidth) p.x = 0;
                if (p.x < 0) p.x = window.innerWidth;
                if (p.y > window.innerHeight) p.y = 0;
                if (p.y < 0) p.y = window.innerHeight;

                // Interactivity: Repel particles from the mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouseRadius) {
                        const angle = Math.atan2(dy, dx);
                        const force = (mouseRadius - distance) / mouseRadius;
                        const repulseFactor = 2;
                        p.vx += Math.cos(angle) * force * repulseFactor;
                        p.vy += Math.sin(angle) * force * repulseFactor;
                    }
                }

                // Reset particle after it reaches its lifespan
                if (p.life > p.maxLife) {
                    p.x = Math.random() * window.innerWidth;
                    p.y = Math.random() * window.innerHeight;
                    p.vx = (Math.random() - 0.5) * 1.5;
                    p.vy = (Math.random() - 0.5) * 1.5;
                    p.size = Math.random() * 2 + 1;
                    p.color = colors[Math.floor(Math.random() * colors.length)];
                    p.opacity = Math.random() * 0.5 + 0.5;
                    p.life = 0;
                    p.maxLife = Math.random() * 100 + 50;
                }

                // Apply slight friction to slow down particles over time
                p.vx *= 0.98;
                p.vy *= 0.98;
            });
        };

        // Draw particles with enhanced glow and sparkle effects
        const drawParticles = () => {
            // Semi-transparent background for trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'lighter'; // Additive blending for glow

            particles.forEach((p) => {
                // Dynamic color shifting using HSLA
                const dynamicHue = (hue + p.life * 0.5) % 360;
                const dynamicColor = `hsla(${dynamicHue}, 100%, 50%, ${p.opacity})`;

                // Radial gradient for glow effect
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
                gradient.addColorStop(0, `hsla(${dynamicHue}, 100%, 50%, 1)`); // Fully opaque center
                gradient.addColorStop(1, `hsla(${dynamicHue}, 100%, 50%, 0)`); // Fully transparent edges

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                ctx.fill();

                // Add sparkle effect randomly
                if (Math.random() < 0.05) { // 5% chance to sparkle
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
                    ctx.fill();
                }
            });

            ctx.globalCompositeOperation = 'source-over'; // Reset to default
        };

        // Animation loop
        const animate = () => {
            hue += 0.2; // Increment hue for overall color shifting
            updateParticles();
            drawParticles();
            requestAnimationFrame(animate);
        };

        // Initialize and start animation
        initParticles();
        animate();

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', throttledResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeChild(canvas);
        };
    }, []);

    return <>{children}</>;
};

export default ParticleBackground;