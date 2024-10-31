import React, { useRef, useEffect, ReactNode } from 'react';

interface CloudBackgroundProps {
  children: ReactNode;
}

const CloudBackground: React.FC<CloudBackgroundProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Vertex shader
    const vertexShaderSource = `
            attribute vec2 aPosition;
            varying vec2 v_fragCoord;
            void main() {
                v_fragCoord = aPosition * 0.5 + 0.5;
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // Fragment shader with adjustments for larger shapes
    const fragmentShaderSource = `#version 300 es
        precision mediump float;

        uniform float iTime;
        uniform vec2 iResolution;
        uniform sampler2D iChannel0;

        in vec2 v_fragCoord;
        out vec4 fragColor;

        // NOISE ////
        vec2 hash2(float n) {
            return fract(sin(vec2(n, n + 1.0)) * vec2(13.5453123, 31.1459123));
        }

        float noise(in vec2 x) {
            vec2 p = floor(x);
            vec2 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
        #ifdef QUINTIC
            vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
        #else
            vec2 u = f * f * (3.0 - 2.0 * f);
        #endif
            float a = textureLod(iChannel0, (p + vec2(0.5, 0.5)) / 256.0, 0.0).x;
            float b = textureLod(iChannel0, (p + vec2(1.5, 0.5)) / 256.0, 0.0).x;
            float c = textureLod(iChannel0, (p + vec2(0.5, 1.5)) / 256.0, 0.0).x;
            float d = textureLod(iChannel0, (p + vec2(1.5, 1.5)) / 256.0, 0.0).x;
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        const mat2 mtx = mat2(0.80,  0.60, -0.60,  0.80);

        float fbm(vec2 p) {
            float f = 0.0;

            f += 0.500000 * noise(p); p = mtx * p * 1.5;
            f += 0.250000 * noise(p); p = mtx * p * 1.5;
            f += 0.125000 * noise(p); p = mtx * p * 1.5;
            f += 0.062500 * noise(p); p = mtx * p * 1.5;
            f += 0.031250 * noise(p); p = mtx * p * 1.5;
            f += 0.015625 * noise(p);
            return f / 0.96875;
        }

        // -----------------------------------------------------------------------

        float pattern(in vec2 p, in float t, in vec2 uv, out vec2 q, out vec2 r, out vec2 g) {
            q = vec2(fbm(p), fbm(p + vec2(10.0, 1.3)));
            float s = dot(uv.x + 0.5, uv.y + 0.5);
            r = vec2(fbm(p + 4.0 * q + vec2(t) + vec2(1.7, 9.2)), fbm(p + 4.0 * q + vec2(t) + vec2(8.3, 2.8)));
            g = vec2(fbm(p + 2.0 * r + vec2(t * 20.0) + vec2(2.0, 6.0)), fbm(p + 2.0 * r + vec2(t * 10.0) + vec2(5.0, 3.0)));
            return fbm(p + 5.5 * g + vec2(-t * 7.0));
        }

        void main() {
            // Normalized pixel coordinates (from 0 to 1)
            vec2 uv = v_fragCoord;

            // Adjust scaling to create larger shapes
            vec2 scaledUV = uv * 2.5; // Increased scale for larger features

            // Noise
            vec2 q, r, g;
            float noiseVal = pattern(scaledUV * vec2(0.004), iTime * 0.007, uv, q, r, g);

            // Base color based on main noise
            vec3 col = mix(vec3(0.1, 0.4, 0.4), vec3(0.5, 0.7, 0.0), smoothstep(0.0, 1.0, noiseVal));

            // Other lower-octave colors and mixes
            col = mix(col, vec3(0.35, 0.0, 0.1), dot(q, q) * 1.0);
            col = mix(col, vec3(0.0, 0.2, 1.0), 0.2 * g.y * g.y);
            col = mix(col, vec3(0.3, 0.0, 0.0), smoothstep(0.0, 0.6, 0.6 * r.y * r.y));
            col = mix(col, vec3(0.0, 0.5, 0.0), 0.1 * g.x);

            // Dark outlines/contrast and different steps
            col = mix(col, vec3(0.0), smoothstep(0.3, 0.5, noiseVal) * smoothstep(0.5, 0.3, noiseVal));
            col = mix(col, vec3(0.0), smoothstep(0.7, 0.8, noiseVal) * smoothstep(0.8, 0.7, noiseVal));

            // Contrast
            col *= noiseVal * 2.0;

            // Vignette
            col *= 0.70 + 0.65 * sqrt(70.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y));

            // Output to screen
            fragColor = vec4(col, 1.0);
        }
        `;
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
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

    // Load a dummy texture for iChannel0
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const data = new Uint8Array([255, 255, 255, 255]); // White pixel
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(iChannel0Location, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let startTime = Date.now();

    // Render loop
    const render = () => {
      const currentTime = (Date.now() - startTime) / 1000;
      gl.uniform1f(iTimeLocation, currentTime);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
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

export default CloudBackground;