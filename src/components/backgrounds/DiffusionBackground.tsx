import React, { useRef, useEffect, ReactNode } from 'react';

interface DiffusionBackgroundProps {
    children: ReactNode;
}

const DiffusionBackground: React.FC<DiffusionBackgroundProps> = ({ children }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl');
        if (!gl) return;

        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 aPosition;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader));
            gl.deleteShader(vertexShader);
            return;
        }

        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            uniform float iTime;
            uniform vec2 iResolution;
            uniform sampler2D iChannel0;
            uniform vec4 iMouse;
            uniform int iFrame;

            #define rnd(U) hash12(U)
            #define T(i,j) texture(iChannel0, fract( ( U +vec2(i,j) ) / iResolution.xy) )
            #define PREVIEW (iResolution.y < 250.0)
            #define K 0.44
            #define L 0.7
            #define M 1.0
            #define TIMESTEP (PREVIEW ? 1.0 : 0.3)
            #define HASHSCALE1 .1031

            float hash12(vec2 p)
            {
                vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
                p3 += dot(p3, p3.yzx + 19.19);
                return fract((p3.x + p3.y) * p3.z);
            }

            vec3 hsv2rgb(vec3 hsv)
            {
                vec3 rgb;
                float h = mod(hsv.x * 6.0, 6.0);
                float q = h - float(int(h));
                if      (h < 1.0) rgb = vec3(1.0, q, 0.0);
                else if (h < 2.0) rgb = vec3(1.0 - q, 1.0, 0.0);
                else if (h < 3.0) rgb = vec3(0.0, 1.0, q);
                else if (h < 4.0) rgb = vec3(0.0, 1.0 - q, 1.0);
                else if (h < 5.0) rgb = vec3(q, 0.0, 1.0);
                else if (h < 6.0) rgb = vec3(1.0, 0.0, 1.0 - q);
                rgb = hsv.z * (1.0 - hsv.y * (1.0 - rgb));
                return rgb;
            }

            vec4 light(sampler2D src, vec2 fragCoord)
            {
                vec4 l = vec4(0.0);
                l += texture(src, (fragCoord + vec2( 0.0,  0.0)) / iResolution.xy);
                l -= texture(src, (fragCoord + vec2(-1.0,  0.0)) / iResolution.xy) * 0.5;
                l -= texture(src, (fragCoord + vec2( 0.0, -1.0)) / iResolution.xy) * 0.5;
                return l;
            }

            void mainImage(out vec4 fragColor, in vec2 fragCoord)
            {
                vec4 col = texture(iChannel0, fragCoord / iResolution.xy);
                vec4 l = light(iChannel0, fragCoord);
                fragColor.xyz = sqrt(col.xyz * 7.5 * col.w) - l.www * 15.0 + l.xyz * 4.0;
            }

            void main()
            {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
            gl.deleteShader(fragmentShader);
            return;
        }

        // Create program
        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking failed:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return;
        }
        gl.useProgram(program);

        // Set up position buffer
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const vertices = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const aPosition = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        // Uniform locations
        const iTimeLocation = gl.getUniformLocation(program, 'iTime');
        const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
        const iChannel0Location = gl.getUniformLocation(program, 'iChannel0');
        const iMouseLocation = gl.getUniformLocation(program, 'iMouse');
        const iFrameLocation = gl.getUniformLocation(program, 'iFrame');

        // Initialize texture for iChannel0
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Initialize with a single white pixel
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.uniform1i(iChannel0Location, 0);

        // Load an initial texture or generate noise if needed
        const initializeTexture = () => {
            const size = 256;
            const data = new Uint8Array(size * size * 4);
            for (let i = 0; i < size * size * 4; i += 4) {
                const value = Math.random() * 255;
                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
                data[i + 3] = 255;
            }
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        };
        initializeTexture();

        // Resize canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        };
        resize();
        window.addEventListener('resize', resize);

        let startTime = Date.now();
        let frameCount = 0;

        // Render loop
        const render = () => {
            const currentTime = (Date.now() - startTime) / 1000;
            gl.uniform1f(iTimeLocation, currentTime);
            gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
            gl.uniform4f(iMouseLocation, 0.0, 0.0, 0.0, 0.0);
            gl.uniform1i(iFrameLocation, frameCount);

            // Bind texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Draw
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            frameCount++;
            requestAnimationFrame(render);
        };
        render();

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', resize);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteProgram(program);
            gl.deleteBuffer(positionBuffer);
            gl.deleteTexture(texture);
        };
    }, []);

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

export default DiffusionBackground;