/** fast, 32-bit state, seeded random number generator
    https://github.com/cprosche/mulberry32 */
export function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 32-bit state PRNG -> [0,1) for per-block color variation
    https://stackoverflow.com/a/52056161 */
export function splitmix32(x: number, y: number, z: number): number {
    let h = Math.imul(x, 0x9e3779b9) ^ Math.imul(y, 0x85ebca6b) ^ Math.imul(z, 0xc2b2ae35);
    h ^= h >>> 16; h = Math.imul(h, 0x21f0aaad);
    h ^= h >>> 15; h = Math.imul(h, 0x735a2d97);

    return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}

/** seeded, 2D simplex noise with fBm
    https://www.npmjs.com/package/simplex-noise */
const GRAD = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

export class Simplex {
  private p = new Uint8Array(512);

  constructor(seed: number) {
    const r = mulberry32(seed);
    const a = Array.from({ length: 256 }, (_, i) => i);

    for (let i = 255; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    for (let i = 0; i < 512; i++) {
        this.p[i] = a[i & 255];
    }
  }

  private corner(dx: number, dy: number, gi: number) {
    let t = 0.5 - dx * dx - dy * dy;
    if (t < 0) return 0;

    t *= t;
    const g = GRAD[gi & 7];

    return t * t * (g[0] * dx + g[1] * dy);
  }

  noise(x: number, y: number): number {
    const s = (x + y) * F2;
    const i = Math.floor(x + s), j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - (i - t), y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const ii = i & 255, jj = j & 255, p = this.p;

    return 70 * (
      this.corner(x0, y0, p[ii + p[jj]]) +
      this.corner(x0 - i1 + G2, y0 - j1 + G2, p[ii + i1 + p[jj + j1]]) +
      this.corner(x0 - 1 + 2 * G2, y0 - 1 + 2 * G2, p[ii + 1 + p[jj + 1]])
    );
  }

  fbm(x: number, y: number, octaves = 4): number {
    let sum = 0, amp = 1, freq = 1, norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += this.noise(x * freq, y * freq) * amp;
      norm += amp; amp *= 0.5; freq *= 2;
    }

    return sum / norm;
  }
}

/** deterministic uint32 hash of variable ints to seed per-cell RNGs
    https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp */
export function hashInts(...n: number[]): number {
    let h = 0;

    for (const v of n) {
        let k = v | 0;

        k = Math.imul(k, 0xcc9e2d51);
        k = (k << 15) | (k >>> 17);
        k = Math.imul(k, 0x1b873593);

        h ^= k;
        h = (h << 13) | (h >>> 19);
        h = (Math.imul(h, 5) + 0xe6546b64) | 0;
    }

    h ^= n.length * 4;

    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;

    return h >>> 0;
}