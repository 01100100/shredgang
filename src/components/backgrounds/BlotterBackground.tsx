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
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            uniform float iTime;
            uniform vec2 iResolution;
            uniform sampler2D iChannel0;
            uniform int iFrame;

            // Reaction-diffusion functions and utilities
            vec3 hash33(in vec2 p){ 
                float n = sin(dot(p, vec2(41.0, 289.0)));    
                return fract(vec3(2097152.0, 262144.0, 32768.0) * n); 
            }

            vec4 tx(in vec2 p){ return texture2D(iChannel0, p); }

            float blur(in vec2 p){
                vec3 e = vec3(0.8, -1.0, 0.3);
                vec2 px = 0.8 / iResolution.xy;
                float res = 0.0;
                res += tx(p + e.xx * px).x + tx(p + e.xz * px).x + tx(p + e.zx * px).x + tx(p + e.zz * px).x * 2.1;
                res += (tx(p + e.xy * px).x + tx(p + e.yx * px).x + tx(p + e.yz * px).x + tx(p + e.zy * px).x) * 1.5;
                res += tx(p + e.yy * px).x * 5.0;
                return res / 16.0;
            }

            void mainImage(out vec4 fragColor, in vec2 fragCoord ){
                vec2 uv = fragCoord / iResolution.xy;
                vec2 pw = 1.0 / iResolution.xy;

                float avgReactDiff = blur(uv);
                vec3 noise = hash33(uv + vec2(53.0, 43.0) * iTime) * 0.6 + 0.2;

                vec3 e = vec3(1.0, 0.2, -2.8);
                vec2 pwr = pw * 2.4;

                vec2 lap = vec2(tx(uv + e.xy * pwr).y - tx(uv - e.xy * pwr).y, tx(uv + e.yx * pwr).y - tx(uv - e.yx * pwr).y);

                uv += lap * pw * 4.1;
                float newReactDiff = tx(uv).x + (noise.z - 0.9) * 0.005 - 0.002;
                newReactDiff += dot(tx(uv + (noise.xy - 0.1) * pw).xy, vec2(1.0, -1.0)) * 0.2;

                if(iFrame > 0) {
                    fragColor.xy = clamp(vec2(newReactDiff, avgReactDiff / 0.95), 0.0, 1.0);
                } else {
                    fragColor = vec4(noise, 1.2);
                }
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        // Create program
        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Set up position buffer
        const positionBuffer = gl.createBuffer()!;
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
        let iTimeLocation = gl.getUniformLocation(program, 'iTime');
        let iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
        let iChannel0Location = gl.getUniformLocation(program, 'iChannel0');
        let iFrameLocation = gl.getUniformLocation(program, 'iFrame');

        // Create two textures for ping-pong
        const textures: WebGLTexture[] = [];
        const framebuffers: WebGLFramebuffer[] = [];
        for (let i = 0; i < 2; i++) {
            const texture = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            textures.push(texture);

            const framebuffer = gl.createFramebuffer()!;
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            framebuffers.push(framebuffer);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Initialize with noise
        let startTime = Date.now();
        let currentFrame = 0;

        // Resize canvas
        const resize = () => {
            if (!canvas) return;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            // Resize textures
            textures.forEach(texture => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    canvas.width,
                    canvas.height,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    null
                );
            });
            // Re-fetch uniform locations
            iTimeLocation = gl.getUniformLocation(program, 'iTime');
            iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
            iChannel0Location = gl.getUniformLocation(program, 'iChannel0');
            iFrameLocation = gl.getUniformLocation(program, 'iFrame');
            // Reset startTime and currentFrame
            startTime = Date.now();
            currentFrame = 0;
        };
        resize();
        window.addEventListener('resize', resize);


        // Render loop
        const render = () => {
            gl.useProgram(program);
            const currentTime = (Date.now() - startTime) / 1000;
            gl.uniform1f(iTimeLocation, currentTime);
            gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
            gl.uniform1i(iFrameLocation, currentFrame);

            // Bind the current framebuffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[currentFrame % 2]);

            // Bind the appropriate texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textures[(currentFrame + 1) % 2]);
            gl.uniform1i(iChannel0Location!, 0);

            // Draw to framebuffer
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            // Bind to default framebuffer for display
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindTexture(gl.TEXTURE_2D, textures[currentFrame % 2]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            currentFrame++;
            requestAnimationFrame(render);
        };
        render();

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', resize);
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