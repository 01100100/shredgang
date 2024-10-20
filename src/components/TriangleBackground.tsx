import React, { useEffect } from 'react';

const TriangleBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        // Any additional JavaScript logic can be added here if needed
    }, []);

    return (
        <div className="triangle-background">
            <div className="overlay"></div>
            <div className="container">
                {Array.from({ length: 60 }).map((_, index) => (
                    <svg key={index} className="shape" viewBox="0 0 100 115" preserveAspectRatio="xMidYMin slice">
                        <polygon
                            points=""
                            fill="none"
                            stroke={`hsl(${(index % 4) * 80}, 100%, 70%)`}
                            strokeWidth="5"
                        >
                            <animate
                                attributeName="points"
                                repeatCount="indefinite"
                                dur="4s"
                                begin={`${index % 4}s`}
                                from="50 57.5, 50 57.5, 50 57.5"
                                to="50 -75, 175 126, -75 126"
                            />
                        </polygon>
                    </svg>
                ))}
            </div>
            <div className="content">{children}</div>
        </div>
    );
};

export default TriangleBackground;