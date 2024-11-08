import React, { useRef, useEffect, ReactNode } from 'react';

interface WarpBackgroundProps {
    children: ReactNode;
    fps?: number;
    scale?: number;
    quality?: 'low' | 'medium' | 'high';
}

const WarpBackground: React.FC<WarpBackgroundProps> = ({
    children,
    fps = 30,
    scale = 0.75,
    quality = 'high'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return;

        const vertexShaderSource = `#version 300 es
            in vec2 aPosition;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `#version 300 es
            precision ${quality === 'low' ? 'lowp' : 'highp'} float;
            uniform float iTime;
            uniform vec2 iResolution;
            out vec4 fragColor;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            vec3 map(vec2 p) {
                p *= 0.8;
                float n = noise(p + iTime * 0.15);
                float f = noise(p * 2.5 + n);
                
                vec3 color1 = vec3(0.65, 0.25, 0.85);
                vec3 color2 = vec3(0.25, 0.05, 0.45);
                
                f = pow(f, 1.2);
                
                return mix(color1, color2, f);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy/iResolution.xy;
                vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy)/min(iResolution.x, iResolution.y);
                
                vec3 col = map(p);
                
                float vig = 1.0 - pow(length(uv - 0.5) * 1.2, 2.0);
                col *= vig;
                
                col = pow(col, vec3(0.95));
                
                fragColor = vec4(col, 1.0);
            }
        `;

        const createShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1, 1, 1
        ]), gl.STATIC_DRAW);

        const aPosition = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const iTimeLocation = gl.getUniformLocation(program, 'iTime');
        const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');

        const resize = () => {
            canvas.width = window.innerWidth * scale;
            canvas.height = window.innerHeight * scale;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener('resize', resize);
        resize();

        let startTime = Date.now();
        let lastFrame = 0;
        const frameInterval = 1000 / fps;

        const render = (timestamp: number) => {
            if (timestamp - lastFrame < frameInterval) {
                animationRef.current = requestAnimationFrame(render);
                return;
            }
            lastFrame = timestamp;

            const currentTime = (Date.now() - startTime) / 1000;
            gl.uniform1f(iTimeLocation, currentTime);
            gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationRef.current = requestAnimationFrame(render);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            } else {
                lastFrame = 0;
                startTime = Date.now() - (lastFrame / 1000);
                animationRef.current = requestAnimationFrame(render);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        animationRef.current = requestAnimationFrame(render);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('resize', resize);
        };
    }, [fps, scale, quality]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                }}
            />
            {children}
        </div>
    );
};

export default WarpBackground;