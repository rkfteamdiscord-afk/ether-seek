import { useEffect, useRef } from "react";

/**
 * Realistic drifting fog: domain-warped fractal noise rendered with WebGL at a low
 * resolution and stretched by the browser, which keeps it soft and cheap.
 * "ground" hugs the bottom of the screen behind the page; "dense" fills the arrival.
 * Purely decorative; renders nothing if WebGL is unavailable and a single still
 * frame when the visitor prefers reduced motion.
 */
const vertex = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const fragment = `
precision mediump float;
uniform vec2 res;
uniform float time;
uniform float dense;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / res;
  vec2 p = vec2(uv.x * res.x / res.y, uv.y) * 2.2;
  float t = time * 0.045;
  // Two rounds of domain warping give the curling, rolling look of real fog.
  vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, 1.3) - vec2(t * 0.7, 0.0)));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7 - t * 1.3, 9.2)), fbm(p + 3.0 * q + vec2(8.3, 2.8 + t)));
  float f = fbm(p + 2.5 * r);
  float shape = smoothstep(0.32, 0.95, f);
  // Ground fog thins with height; dense fog fills the whole frame.
  float height = mix(smoothstep(0.75, 0.0, uv.y), 0.55 + 0.45 * smoothstep(1.0, 0.0, uv.y), dense);
  float alpha = shape * height * mix(0.75, 0.95, dense);
  vec3 shadow = vec3(0.16, 0.12, 0.26);
  vec3 moonlit = vec3(0.62, 0.58, 0.78);
  vec3 ember = vec3(0.85, 0.48, 0.22);
  vec3 col = mix(shadow, moonlit, clamp(f * 1.25 + length(q) * 0.25, 0.0, 1.0));
  col = mix(col, ember, 0.18 * smoothstep(0.5, 1.0, uv.x) * smoothstep(0.6, 0.0, uv.y));
  gl_FragColor = vec4(col * alpha, alpha);
}`;

export function FogShader({ variant = "ground" }: { variant?: "ground" | "dense" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!canvas || !gl) return;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source); gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "res");
    const time = gl.getUniformLocation(program, "time");
    gl.uniform1f(gl.getUniformLocation(program, "dense"), variant === "dense" ? 1 : 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Low resolution on purpose: the CSS stretch acts as a free blur.
    const scale = variant === "dense" ? 0.3 : 0.22;
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
    };
    resize(); window.addEventListener("resize", resize);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0, drawn = 0;
    const draw = (now: number) => {
      // The fog drifts slowly: 30 frames a second look the same and halve the GPU work.
      if (!still && now - drawn < 30) { raf = requestAnimationFrame(draw); return; }
      drawn = now;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(time, 20 + (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!still) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [variant]);
  return <canvas ref={ref} className={`fog-shader fog-shader-${variant}`} aria-hidden="true" />;
}
