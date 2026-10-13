import { hash } from "./hash";

// skew factors to map square grid to triagular (simplex)
const SKEW = 0.5 * (Math.sqrt(3) - 1);
const UNSKEW = (3 - Math.sqrt(3)) / 6;

// 16 unit-length gradient directions at 22.5-degree steps
const GRAD_X = new Float64Array([
  1, 0.9238795325112867, 0.7071067811865476, 0.3826834323650898,
  0, -0.3826834323650897, -0.7071067811865475, -0.9238795325112867,
  -1, -0.9238795325112868, -0.7071067811865477, -0.3826834323650903,
  0, 0.38268343236509, 0.7071067811865474, 0.9238795325112865,
]);
const GRAD_Z = new Float64Array([
  0, 0.3826834323650898, 0.7071067811865475, 0.9238795325112867,
  1, 0.9238795325112867, 0.7071067811865476, 0.3826834323650899,
  0, -0.3826834323650897, -0.7071067811865475, -0.9238795325112865,
  -1, -0.9238795325112866, -0.7071067811865477, -0.3826834323650904,
]);

// scales sum of three corner contributions to span [-1, 1]
const OUTPUT_SCALE = 99;

// sd of one octave of noise to normalize octave sums
export const SIMPLEX_SD = 0.5393;

// seeded, 2D simplex noise within [-1, 1], salt for independent permutation per layer
export class Simplex2D {
    // shuffled 0..255 repeated twice for no wrapping lookups
    private readonly perm = new Uint8Array(512);

    constructor(seed: number, salt = 0) {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        // fisher-yates with hash
        for (let i = 255; i > 0; i--) {
            const j = hash(seed, salt, i) % (i + 1);
            const t = p[i]; p[i] = p[j]; p[j] = t;
        }

        for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    }

    noise(x: number, z: number): number {
        const perm = this.perm;
        // find skewed cell (i, j) containing (x, z) and offset from cell origin
        const skew = (x + z) * SKEW;
        const i = Math.floor(x + skew), j = Math.floor(z + skew);
        const unskew = (i + j) * UNSKEW;
        const x0 = x - (i - unskew), z0 = z - (j - unskew);
        // determine second corner from triangle containing (x, z)
        const i1 = x0 > z0 ? 1 : 0, j1 = 1 - i1;
        const x1 = x0 - i1 + UNSKEW, z1 = z0 - j1 + UNSKEW;         // offset from second corner
        const x2 = x0 - 1 + 2 * UNSKEW, z2 = z0 - 1 + 2 * UNSKEW;   // offset from third corner
        // pick pseudo-random gradient for each corner
        const ii = i & 255, jj = j & 255;
        const g0 = perm[ii + perm[jj]] & 15;
        const g1 = perm[ii + i1 + perm[jj + j1]] & 15;
        const g2 = perm[ii + 1 + perm[jj + 1]] & 15;
        // sum corner's contribution
        let sum = 0;
        let t = 0.5 - x0 * x0 - z0 * z0;
        if (t > 0) {
            t *= t; sum += t * t * (GRAD_X[g0] * x0 + GRAD_Z[g0] * z0);
        }
        t = 0.5 - x1 * x1 - z1 * z1;
        if (t > 0) {
            t *= t; sum += t * t * (GRAD_X[g1] * x1 + GRAD_Z[g1] * z1);
        }
        t = 0.5 - x2 * x2 - z2 * z2;
        if (t > 0) {
            t *= t; sum += t * t * (GRAD_X[g2] * x2 + GRAD_Z[g2] * z2);
        }
        
        return OUTPUT_SCALE * sum;
    }
}
