import { useEffect } from 'react';

const EventBackground = ({ children }) => {
    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const particles = [];
        const maxParticles = 300;
        const lifespan = 1000;

        function createParticle() {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const hue = Math.random() * 360;
            return { x, y, hue, age: 0 };
        }

        function updateParticles() {
            particles.forEach(p => {
                p.age++;
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
                ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${1 - p.age / lifespan})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
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

    return (
        <div className="event-background">
            {children}
        </div>
    );
};

export default EventBackground;