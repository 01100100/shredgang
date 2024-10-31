import React, { useEffect, ReactNode } from 'react';

interface FuzzBackgroundProps {
    children: ReactNode;
}

const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;

    // Improved noise function using multiple layers
    float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // Rotation matrix
    mat2 rotate2D(float angle){
        return mat2(cos(angle), -sin(angle),
                   sin(angle), cos(angle));
    }

    void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        vec2 center = vec2(0.5, 0.5);
        st -= center;
        
        // Apply rotation over time
        float angle = u_time * 0.1;
        st = rotate2D(angle) * st;
        st += center;

        // Multiple noise layers
        float n1 = noise(st * 3.0 + u_time * 0.2);
        float n2 = noise(st * 6.0 - u_time * 0.15);
        float n3 = noise(st * 12.0 + u_time * 0.3);

        // Combine noises with different weights
        float combinedNoise = (n1 * 0.5) + (n2 * 0.3) + (n3 * 0.2);

        // Dynamic color gradients
        vec3 color1 = vec3(0.5 + 0.5 * sin(u_time + combinedNoise * 6.2831),
                           0.5 + 0.5 * cos(u_time + combinedNoise * 6.2831),
                           0.5 + 0.5 * sin(u_time + combinedNoise * 6.2831 + 1.5708));

        vec3 color2 = vec3(0.5 + 0.5 * cos(u_time + combinedNoise * 6.2831),
                           0.5 + 0.5 * sin(u_time + combinedNoise * 6.2831),
                           0.5 + 0.5 * cos(u_time + combinedNoise * 6.2831 + 1.5708));

        // Blend colors based on noise
        vec3 finalColor = mix(color1, color2, combinedNoise);

        // Add glow effect
        float glow = smoothstep(0.4, 0.5, combinedNoise);
        finalColor += vec3(glow);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const FuzzBackground: React.FC<FuzzBackgroundProps> = ({ children }) => {
    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-2';
        document.body.appendChild(canvas);

        const gl = canvas.getContext('webgl');
        if (!gl) return;

        // Compile shader
        const compileShader = (source: string, type: number): WebGLShader | null => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
        if (!vertexShader || !fragmentShader) return;

        // Link program
        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return;
        }
        gl.useProgram(program);

        // Set up geometry
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Get uniform locations
        const timeLocation = gl.getUniformLocation(program, 'u_time');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

        // Resize canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        };
        resize();
        window.addEventListener('resize', resize);

        let startTime = Date.now();

        // Render loop
        const render = () => {
            const currentTime = (Date.now() - startTime) / 1000;
            gl.uniform1f(timeLocation, currentTime);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        };
        render();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resize);
            document.body.removeChild(canvas);
        };
    }, []);

    return <>{children}</>;
};

export default FuzzBackground;