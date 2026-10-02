import * as THREE from 'three';

import { DAY_SECONDS, DAY_START } from '../config';

// day cycle: t = 0 sunrise, 0.25 noon, 0.5 sunset, 0.75 midnight
const KEYS = [
    { t: 0.00, zenith: 0x4f6fb8, horizon: 0xf3b48a, light: 0xffd2a0 },   // sunrise
    { t: 0.07, zenith: 0x3f7fd8, horizon: 0xc4d8ee, light: 0xfff0dc },
    { t: 0.25, zenith: 0x2a74dc, horizon: 0xaed2f4, light: 0xffffff },   // noon
    { t: 0.43, zenith: 0x3f78d0, horizon: 0xdccdb4, light: 0xfff0d8 },
    { t: 0.50, zenith: 0x35407f, horizon: 0xf08858, light: 0xffa878 },   // sunset
    { t: 0.57, zenith: 0x161b3d, horizon: 0x3c3860, light: 0x6a6fb0 },   // dusk
    { t: 0.75, zenith: 0x04060e, horizon: 0x101628, light: 0x2a3868 },   // night
    { t: 0.93, zenith: 0x161b3d, horizon: 0x3c3860, light: 0x6a6fb0 },
    { t: 1.00, zenith: 0x4f6fb8, horizon: 0xf3b48a, light: 0xffd2a0 },
];

const VERT = `
varying vec3 vDir;

void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position.z = gl_Position.w;      // always at the far plane
}
`;

const FRAG = `
uniform vec3 uZenith, uHorizon, uSunDir;
uniform float uTime, uNight, uCloud;
varying vec3 vDir;

float h21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vn(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 4; i++) {
        s += a * vn(p); p *= 2.03; a *= 0.5;
    }
    return s;
}

void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, 0.0, 1.0);
    vec3 col = mix(uHorizon, uZenith, pow(h, 0.45));
    
    // stars
    col += vec3(step(0.996, h21(floor(d.xz / (abs(d.y) + 0.3) * 90.0)))) * uNight * smoothstep(0.1, 0.4, d.y);
    
    // sun: tight disc plus a soft glow
    float sd = max(dot(d, uSunDir), 0.0);
    col += vec3(1.0, 0.88, 0.65) * (pow(sd, 900.0) * 3.0 + pow(sd, 12.0) * 0.25);
    
    // drifting clouds, lit by the current light level
    if (d.y > 0.01) {
        vec2 p = d.xz / (d.y + 0.12) * 1.6 + vec2(uTime * 0.02, 0.0);
        float c = smoothstep(0.52, 0.78, fbm(p)) * smoothstep(0.01, 0.18, d.y);
        col = mix(col, mix(vec3(1.0), uHorizon, 0.25) * uCloud, c * 0.9);
    }
    gl_FragColor = vec4(col, 1.0);   // sRGB values, matching how three encodes the fog colour
}
`;

export class Sky {
    readonly light = new THREE.Color(1, 1, 1);      // current sun/moon light multiplier
    
    private keys = KEYS.map((k) => ({
        t: k.t,
        zenith: new THREE.Color().setHex(k.zenith, THREE.SRGBColorSpace),
        horizon: new THREE.Color().setHex(k.horizon, THREE.SRGBColorSpace),
        light: new THREE.Color().setHex(k.light, THREE.LinearSRGBColorSpace),
    }));

    private zenith = new THREE.Color();
    private horizon = new THREE.Color();

    private u = {
        uZenith: { value: new THREE.Vector3() },
        uHorizon: { value: new THREE.Vector3() },
        uSunDir: { value: new THREE.Vector3(0, 1, 0) },
        uTime: { value: 0 },
        uNight: { value: 0 },
        uCloud: { value: 1 },
    };

    private mesh = new THREE.Mesh(
        new THREE.SphereGeometry(100, 32, 16),
        new THREE.ShaderMaterial({
            uniforms: this.u,
            vertexShader: VERT,
            fragmentShader: FRAG,
            side: THREE.BackSide,
            depthWrite: false,
            fog: false
        })
    );

    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.mesh.frustumCulled = false;
        this.mesh.renderOrder = -1;
        this.scene.add(this.mesh);
    }

    update(seconds: number, camPos: THREE.Vector3) {
        const t = (DAY_START + seconds / DAY_SECONDS) % 1;

        let i = 0;
        while (i < this.keys.length - 2 && t > this.keys[i + 1].t) i++;
        
        const a = this.keys[i];
        const b = this.keys[i + 1];
        const f = (t - a.t) / (b.t - a.t);

        this.zenith.copy(a.zenith).lerp(b.zenith, f);
        this.horizon.copy(a.horizon).lerp(b.horizon, f);
        this.light.copy(a.light).lerp(b.light, f);

        const rgb = { r: 0, g: 0, b: 0};
        this.zenith.getRGB(rgb, THREE.SRGBColorSpace);
        this.u.uZenith.value.set(rgb.r, rgb.g, rgb.b);
        this.horizon.getRGB(rgb, THREE.SRGBColorSpace);
        this.u.uHorizon.value.set(rgb.r, rgb.g, rgb.b);

        const ang = t * Math.PI * 2;

        this.u.uSunDir.value.set(Math.cos(ang), Math.sin(ang) * 0.55, -0.8).normalize();
        this.u.uNight.value = Math.min(1, Math.max(0, -Math.sin(ang) * 2.5));
        this.u.uCloud.value = Math.min(1, 0.2126 * this.light.r + 0.7152 * this.light.g + 0.0722 * this.light.b + 0.05);
        this.u.uTime.value = seconds;

        if (this.scene.fog) this.scene.fog.color.copy(this.horizon);
        if (this.scene.background instanceof THREE.Color) this.scene.background.copy(this.horizon);
        this.mesh.position.copy(camPos);
    }
}
