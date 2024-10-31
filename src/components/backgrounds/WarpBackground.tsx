import React, { useRef, useEffect, ReactNode } from 'react';

interface WarpBackgroundProps {
    children: ReactNode;
}

const WarpBackground: React.FC<WarpBackgroundProps> = ({ children }) => {
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

        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            uniform float iTime;
            uniform vec2 iResolution;

            // Provided shader effect
            const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );
            
            float hash( vec2 p )
            {
                float h = dot(p,vec2(127.1,311.7));
                return -1.0 + 2.0*fract(sin(h)*43758.5453123);
            }
            
            float noise( in vec2 p )
            {
                vec2 i = floor( p );
                vec2 f = fract( p );

                vec2 u = f*f*(3.0-2.0*f);

                return mix( mix( hash( i + vec2(0.0,0.0) ), 
                                 hash( i + vec2(1.0,0.0) ), u.x),
                            mix( hash( i + vec2(0.0,1.0) ), 
                                 hash( i + vec2(1.0,1.0) ), u.x), u.y);
            }
            
            float fbm( vec2 p )
            {
                float f = 0.0;
                f += 0.5000*noise( p ); p = m*p*2.02;
                f += 0.2500*noise( p ); p = m*p*2.03;
                f += 0.1250*noise( p ); p = m*p*2.01;
                f += 0.0625*noise( p );
                return f/0.9375;
            }
            
            vec2 fbm2( in vec2 p )
            {
                return vec2( fbm(p.xy), fbm(p.yx) );
            }
            
            vec3 map( vec2 p )
            {   
                p *= 0.7;

                float f = dot( fbm2( 1.0*(0.05*iTime + p + fbm2(-0.05*iTime+2.0*(p + fbm2(4.0*p)))) ), vec2(1.0,-1.0) );

                float bl = smoothstep( -0.8, 0.8, f );

                float ti = smoothstep( -1.0, 1.0, fbm(p) );

                // Reduced brightness for dark areas
                return mix( mix( vec3(0.60, 0.20, 0.80), 
                                 vec3(0.70, 0.40, 1.00), ti ), 
                                 vec3(0.30, 0.10, 0.50), bl );
            }
            
            void mainImage( out vec4 fragColor, in vec2 fragCoord )
            {
                vec2 p = (-iResolution.xy+2.0*fragCoord.xy)/iResolution.y;

                float e = 0.0045;

                vec3 colc = map( p               ); float gc = dot(colc,vec3(0.333));
                vec3 cola = map( p + vec2(e,0.0) ); float ga = dot(cola,vec3(0.333));
                vec3 colb = map( p + vec2(0.0,e) ); float gb = dot(colb,vec3(0.333));
                
                vec3 nor = normalize( vec3(ga-gc, e, gb-gc ) );

                vec3 col = colc;
                col += vec3(0.6, 0.4, 1.0)*8.0*abs(2.0*gc-ga-gb);
                col *= 1.0+0.2*nor.y*nor.y;
                col += 0.05*nor.y*nor.y*nor.y;
                
                
                vec2 q = fragCoord.xy/iResolution.xy;
                col *= pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.1);
                
                fragColor = vec4( col, 1.0 );
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
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

        // Set up position buffer using Triangle Strip
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
            gl.uniform1f(iTimeLocation, currentTime);
            gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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

export default WarpBackground;