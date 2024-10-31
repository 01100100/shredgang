import React, { useEffect } from 'react';

const DotBackground = ({ children }) => {
    useEffect(() => {
        const generateDots = (count) => {
            let textShadow = '';
            for (let i = 0; i <= count; i++) {
                const x = (-50 + Math.random() * 100) + 'vw'; // Spread across 100% of the screen width
                const y = (-50 + Math.random() * 100) + 'vh'; // Spread across 100% of the screen height
                const color = `hsla(${Math.random() * 360}, 100%, 50%, 0.9)`;
                textShadow += `${x} ${y} 2px ${color}, `;
            }
            return textShadow.slice(0, -2); // Remove the last comma and space
        };

        const style = document.createElement('style');
        style.innerHTML = `
            .dot-background {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
                font: 5vmin/1.3 Serif;
                background: #123;
            }
            .dot-background::before, .dot-background::after {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 1em;
                height: 1em;
                content: '❤️';
                mix-blend-mode: screen;
                animation: 44s -27s move infinite ease-in-out alternate;
            }
            .dot-background::before {
                text-shadow: ${generateDots(40)};
                animation-duration: 44s;
                animation-delay: -27s;
            }
            .dot-background::after {
                text-shadow: ${generateDots(40)};
                animation-duration: 43s;
                animation-delay: -32s;
            }
            @keyframes move {
                from {
                    transform: rotate(0deg) translateX(-20px);
                }
                to {
                    transform: rotate(0deg) translateX(20px);
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <>
            <div className="dot-background"></div>
            {children}
        </>
    );
};

export default DotBackground;