// src/components/ShaderBackground.tsx

import React, { useEffect, ReactNode } from 'react';

interface ShaderBackgroundProps {
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

    // CC0: Electric Eel Universe
    #define PI              3.141592654
    #define TAU             (2.0*PI)
    #define TIME            u_time
    #define RESOLUTION      u_resolution
    #define ROT(a)          mat2(cos(a), sin(a), -sin(a), cos(a))
    
    const vec4 hsv2rgb_K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 hsv2rgb(vec3 c) {
      vec3 p = abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www);
      return c.z * mix(hsv2rgb_K.xxx, clamp(p - hsv2rgb_K.xxx, 0.0, 1.0), c.y);
    }
    #define HSV2RGB(c)  (c.z * mix(hsv2rgb_K.xxx, clamp(abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www) - hsv2rgb_K.xxx, 0.0, 1.0), c.y))
    
    float hash(float co) {
      return fract(sin(co*12.9898) * 13758.5453);
    }
    
    float mod1(inout float p, float size) {
      float halfsize = size*0.5;
      float c = floor((p + halfsize)/size);
      p = mod(p + halfsize, size) - halfsize;
      return c;
    }
    
    vec2 rayCylinder(vec3 ro, vec3 rd, vec3 cb, vec3 ca, float cr) {
      vec3  oc = ro - cb;
      float card = dot(ca,rd);
      float caoc = dot(ca,oc);
      float a = 1.0 - card*card;
      float b = dot(oc, rd) - caoc*card;
      float c = dot(oc, oc) - caoc*caoc - cr*cr;
      float h = b*b - a*c;
      if(h < 0.0) return vec2(-1.0);
      h = sqrt(h);
      return vec2(-b - h, -b + h) / a;
    }
    
    float dfcos(float x) {
      return sqrt(x*x + 1.0) * 0.8 - 1.8;
    }
    
    float dfcos(vec2 p, float freq) {
      float x = p.x;
      float y = p.y;
      x *= freq;
        
      float x1 = abs(mod(x + PI, TAU) - PI);
      float x2 = abs(mod(x, TAU) - PI);
        
      float a = 0.18 * freq;
        
      x1 /= max(y * a + 1.0 - a, 1.0);
      x2 /= max(-y * a + 1.0 - a, 1.0);
      return (mix(-dfcos(x2) - 1.0, dfcos(x1) + 1.0, clamp(y * 0.5 + 0.5, 0.0, 1.0))) / max(freq * 0.8, 1.0) + max(abs(y) - 1.0, 0.0) * sign(y);
    }
    
    vec3 skyColor(vec3 ro, vec3 rd) {
      const vec3 l = normalize(vec3(0.0, 0.0, -1.0));
      const vec3 baseCol = HSV2RGB(vec3(0.6, 0.95, 0.0025));
      return baseCol / (1.00001 + dot(rd, l));
    }
    
    vec3 color(vec3 ww, vec3 uu, vec3 vv, vec3 ro, vec2 p) {
      const float rdd = 2.0;
      const float mm = 4.0;
      const float rep = 27.0;
    
      vec3 rd = normalize(-p.x * uu + p.y * vv + rdd * ww);
      
      vec3 skyCol = skyColor(ro, rd);
    
      rd.yx *= ROT(0.1 * TIME);
    
      vec3 col = skyCol;
    
      float a = atan(rd.y, rd.x);
      for(float i = 0.0; i < mm; ++i) {
        float ma = a;
        float sz = rep + i * 6.0;
        float slices = TAU / sz; 
        float na = mod1(ma, slices);
    
        float h1 = hash(na + 13.0 * i + 123.4);
        float h2 = fract(h1 * 3677.0);
        float h3 = fract(h1 * 8677.0);
    
        float tr = mix(0.5, 3.0, h1);
        vec2 tc = rayCylinder(ro, rd, ro, vec3(0.0, 0.0, 1.0), tr);
        vec3 tcp = ro + tc.y * rd;
        vec2 tcp2 = vec2(tcp.z, atan(tcp.y, tcp.x));
      
        float zz = mix(0.025, 0.05, sqrt(h1)) * rep / sz;
        float tnpy = mod1(tcp2.y, slices);
        float fo = smoothstep(0.5 * slices, 0.25 * slices, abs(tcp2.y));
        tcp2.x += -h2 * TIME;
        tcp2.y *= tr * PI / 3.0;
    
        tcp2 /= zz;
        float d = dfcos(tcp2, 2.0 * zz);
        d = abs(d);
        d *= zz;
    
        vec3 bcol = (1.0 + cos(vec3(0.0, 1.0, 2.0) + TAU * h3 + 0.5 * h2 * h2 * tcp.z)) * 0.00005;
        bcol /= max(d * d, 0.000 + 5E-7 * tc.y * tc.y);
        bcol *= exp(-0.04 * tc.y * tc.y);
        bcol *= smoothstep(-0.5, 1.0, sin(mix(0.125, 1.0, h2) * tcp.z));
        bcol *= fo;
        col += bcol;
      }
    
      return col;
    }
    
    vec3 sRGB(vec3 t) {
      return mix(1.055 * pow(t, vec3(1.0 / 2.4)) - 0.055, 12.92 * t, step(t, vec3(0.0031308)));
    }
    
    vec3 aces_approx(vec3 v) {
      v = max(v, 0.0);
      v *= 0.6;
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((v * (a * v + b)) / (v * (c * v + d) + e), 0.0, 1.0);
    }
    
    vec3 effect(vec2 p, vec2 pp) {
      float tm = 1.5 * TIME + 12.3;
      vec3 ro   = vec3(0.0, 0.0, tm);
      vec3 dro  = normalize(vec3(1.0, 0.0, 3.0));
      dro.xz *= ROT(0.2 * sin(0.05 * tm));
      dro.yz *= ROT(0.2 * sin(0.05 * tm * sqrt(0.5)));
      const vec3 up = vec3(0.0, 1.0, 0.0);
      vec3 ww = normalize(dro);
      vec3 uu = normalize(cross(up, ww));
      vec3 vv = cross(ww, uu);
      vec3 col = color(ww, uu, vv, ro, p);
      col -= 0.125 * vec3(0.0, 1.0, 2.0).yzx * length(pp);
      col = aces_approx(col);
      col = sRGB(col);
      return col;
    }
    
    void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 q = fragCoord / RESOLUTION.xy;
        vec2 p = -1.0 + 2.0 * q;
        vec2 pp = p;
        p.x *= RESOLUTION.x / RESOLUTION.y;
    
        vec3 col = effect(p, pp);
        gl_FragColor = vec4(col, 1.0);
    }
`;

const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ children }) => {
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

        const timeLocation = gl.getUniformLocation(program, 'u_time');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        };
        resize();
        window.addEventListener('resize', resize);

        let startTime = Date.now();

        const render = () => {
            const currentTime = (Date.now() - startTime) / 1000;
            gl.uniform1f(timeLocation, currentTime);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            document.body.removeChild(canvas);
        };
    }, []);

    return <>{children}</>;
};

export default ShaderBackground;