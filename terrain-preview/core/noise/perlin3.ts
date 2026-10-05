import { hash } from "../hash";

// 16 gradients: the 12 cube-edge directions of Perlin's improved noise, 4 repeated to fill 16 slots.
const GX = new Float64Array([1, -1, 1, -1, 1, -1, 1, -1, 0, 0, 0, 0, 1, 0, -1, 0]);
const GY = new Float64Array([1, 1, -1, -1, 0, 0, 0, 0, 1, -1, 1, -1, 1, -1, 1, -1]);
const GZ = new Float64Array([0, 0, 0, 0, 1, 1, -1, -1, 1, 1, -1, -1, 0, 1, 0, -1]);

/** Std-dev of one Perlin3 octave (measured over ~16M samples). Used to normalise sums of octaves. */
export const PERLIN3_STD = 0.2708;

const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number): number => a + t * (b - a);
const grad = (h: number, x: number, y: number, z: number): number =>
  GX[h & 15] * x + GY[h & 15] * y + GZ[h & 15] * z;

/**
 * Seeded 3D gradient ("improved") Perlin noise, output within about [-1, 1].
 * Zero at every integer lattice point, so callers should offset each octave (OctaveNoise3 does).
 * Deterministic across engines: only + - * and Math.floor.
 */
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

    // Hash the 8 corners of the unit cube containing the point.
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
    const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

    return lerp(w,
      lerp(v,
        lerp(u, grad(p[AA], fx, fy, fz), grad(p[BA], fx - 1, fy, fz)),
        lerp(u, grad(p[AB], fx, fy - 1, fz), grad(p[BB], fx - 1, fy - 1, fz))),
      lerp(v,
        lerp(u, grad(p[AA + 1], fx, fy, fz - 1), grad(p[BA + 1], fx - 1, fy, fz - 1)),
        lerp(u, grad(p[AB + 1], fx, fy - 1, fz - 1), grad(p[BB + 1], fx - 1, fy - 1, fz - 1))));
  }
}

export interface Octave3Config {
  /** Horizontal wavelength of the first (coarsest) octave, in blocks. */
  wavelengthXZ: number;
  /** Vertical wavelength of the first octave. Smaller than the horizontal one = features stretched tall. */
  wavelengthY: number;
  /** Octaves; each has half the wavelength and half the amplitude of the one before. */
  octaves: number;
}

interface Octave3 { noise: Perlin3; fxz: number; fy: number; weight: number; ox: number; oy: number; oz: number }

/** Sum of Perlin3 octaves scaled to unit std-dev (multiply by an amplitude to use it). */
export class OctaveNoise3 {
  private readonly octaves: Octave3[] = [];

  constructor(seed: number, salt: number, config: Octave3Config) {
    let sumSq = 0;
    for (let i = 0; i < config.octaves; i++) {
      const weight = Math.pow(0.5, i);
      sumSq += weight * weight;
      const s = salt * 64 + i;
      const offset = (k: number) => (hash(seed, s, 1000 + k) / 4294967296) * 256;   // random origin per octave
      this.octaves.push({
        noise: new Perlin3(seed, s),
        fxz: Math.pow(2, i) / config.wavelengthXZ,
        fy: Math.pow(2, i) / config.wavelengthY,
        weight, ox: offset(0), oy: offset(1), oz: offset(2),
      });
    }
    const unit = 1 / (PERLIN3_STD * Math.sqrt(sumSq));
    for (const o of this.octaves) o.weight *= unit;
  }

  sample(x: number, y: number, z: number): number {
    let sum = 0;
    for (const o of this.octaves) sum += o.weight * o.noise.noise(x * o.fxz + o.ox, y * o.fy + o.oy, z * o.fxz + o.oz);
    return sum;
  }
}
