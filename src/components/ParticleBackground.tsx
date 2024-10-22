import React, { useEffect } from 'react';

const ParticleBackground = ({ children }) => {
    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const particles = [];
        const maxParticles = 420;
        const lifespan = 3000;

        // Handle high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);

        const colors = ['#800080', '#FF0000', '#0000FF', '#FFA500', '#FFD700', '#C8A2C8']; // Purple, Red, Blue, Orange, Gold, Lilac

        function createParticle() {
            const x = Math.random() * canvas.width / dpr;
            const y = Math.random() * canvas.height / dpr;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const vx = (Math.random() - 0.5) * 2; // Velocity in x direction
            const vy = (Math.random() - 0.5) * 2; // Velocity in y direction
            return { x, y, color, age: 0, vx, vy };
        }

        function updateParticles() {
            particles.forEach(p => {
                p.age++;
                p.x += p.vx;
                p.y += p.vy;
                if (p.age > lifespan) {
                    particles.splice(particles.indexOf(p), 1);
                }
            });
            while (particles.length < maxParticles) {
                particles.push(createParticle());
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); // Increased radius to 2
                ctx.fill();
            });
        }

        function animate() {
            updateParticles();
            drawParticles();
            requestAnimationFrame(animate);
        }

        animate();

        return () => {
            document.body.removeChild(canvas);
        };
    }, []);

    return <>{children}</>;
};

export default ParticleBackground;