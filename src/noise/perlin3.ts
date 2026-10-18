import { hash } from "./hash";
import { ROTATION_COS, ROTATION_SIN } from "./octave";

// 16 gradients: 12 cube-edge directions of Perlin noise, 4 repeated
const GX = new Float64Array([1, -1,  1, -1, 1, -1,  1, -1, 0,  0,  0,  0, 1,  0, -1,  0]);
const GY = new Float64Array([1,  1, -1, -1, 0,  0,  0,  0, 1, -1,  1, -1, 1, -1,  1, -1]);
const GZ = new Float64Array([0,  0,  0,  0, 1,  1, -1, -1, 1,  1, -1, -1, 0,  1,  0, -1]);

// sd of single Perlin3 octave
export const PERLIN3_SD = 0.2720;

export const MIN_WAVELENGTH_XZ = 8;
export const MIN_WAVELENGTH_Y = 16;

const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number): number => a + t * (b - a);
const grad = (h: number, x: number, y: number, z: number): number => {
    const g = h & 15;
    return GX[g] * x + GY[g] * y + GZ[g] * z;
};

// seeded 3D gradient Perlin noise, output within about [-1, 1]
export class Perlin3 {
    private readonly perm = new Uint8Array(512);

    constructor(seed: number, salt = 0) {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = hash(seed, salt, i) % (i + 1);
            const t = p[i]; p[i] = p[j]; p[j] = t;
        }
        for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    }

    noise(x: number, y: number, z: number): number {
        const p = this.perm;
        const xf = Math.floor(x), yf = Math.floor(y), zf = Math.floor(z);
        
        const X = xf & 255, Y = yf & 255, Z = zf & 255;
        const fx = x - xf, fy = y - yf, fz = z - zf;
        
        const u = fade(fx), v = fade(fy), w = fade(fz);

        // hash 8 corners of unit cube around point
        const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
        const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

        return lerp(w,
            lerp(v,
                lerp(u, grad(p[AA], fx, fy, fz), grad(p[BA], fx - 1, fy, fz)),
                lerp(u, grad(p[AB], fx, fy - 1, fz), grad(p[BB], fx - 1, fy - 1, fz))
            ),
            lerp(v,
                lerp(u, grad(p[AA + 1], fx, fy, fz - 1), grad(p[BA + 1], fx - 1, fy, fz - 1)),
                lerp(u, grad(p[AB + 1], fx, fy - 1, fz - 1), grad(p[BB + 1], fx - 1, fy - 1, fz - 1))
            )
        );
    }
}

export interface Octave3Config {
    wavelengthXZ: number;
    wavelengthY: number;
    amplitudes: readonly number[];
}

interface Octave3 {
    noise: Perlin3;
    fxz: number;
    fy: number;
    weight: number;
    cos: number;
    sin: number;
    ox: number; 
    oy: number;
    oz: number;
}

export class OctaveNoise3 {
    private readonly octaves: Octave3[] = [];
    readonly maxAbs: number;

    constructor(seed: number, salt: number, config: Octave3Config) {
        const { wavelengthXZ, wavelengthY, amplitudes } = config;
        if (!(wavelengthXZ > 0 && wavelengthY > 0)) throw new RangeError("wavelengths must be positive");

        let sumSq = 0;
        amplitudes.forEach((amplitude, i) => {
            if (!Number.isFinite(amplitude) || amplitude < 0) throw new RangeError(`bad amplitude at octave ${i}`);
            if (amplitude === 0) return;

            const div = 2 ** i;
            if (wavelengthXZ / div < MIN_WAVELENGTH_XZ || wavelengthY / div < MIN_WAVELENGTH_Y) {
                throw new RangeError(
                    `octave ${i} aliases on sampling lattice: ` +
                    `${wavelengthXZ / div} (min ${MIN_WAVELENGTH_XZ}) xz, ${wavelengthY / div} (min ${MIN_WAVELENGTH_Y}) y; ` +
                    `zero amplitude or raise wavelengths`
                );
            }

            const weight = amplitude * 0.5 ** i;
            sumSq += weight * weight;

            const s = salt * 64 + i;
            const offset = (k: number) => (hash(seed, s, 1000 + k) / 4294967296) * 256;
            
            this.octaves.push({
                noise: new Perlin3(seed, s),
                fxz: div / wavelengthXZ,
                fy: div / wavelengthY,
                weight,
                cos: ROTATION_COS[i % ROTATION_COS.length],
                sin: ROTATION_SIN[i % ROTATION_SIN.length],
                ox: offset(0),
                oy: offset(1),
                oz: offset(2),
            });
        });
        if (this.octaves.length === 0) throw new Error("OctaveNoise3 needs at least one non-zero amplitude");

        const unit = 1 / (PERLIN3_SD * Math.sqrt(sumSq));
        for (const o of this.octaves) o.weight *= unit;

        this.maxAbs = this.octaves.reduce((s, o) => s + o.weight, 0);
    }

    sample(x: number, y: number, z: number): number {
        let sum = 0;
        for (const o of this.octaves) {
            const rx = x * o.cos - z * o.sin;
            const rz = x * o.sin + z * o.cos;
            
            sum += o.weight * o.noise.noise(
                rx * o.fxz + o.ox,
                y * o.fy + o.oy,
                rz * o.fxz + o.oz
            );
        }
        return sum;
    }
}
