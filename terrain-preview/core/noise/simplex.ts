import { hash } from "../hash";

// Skew factors that map the square grid onto the triangular (simplex) grid and back.
const SKEW = 0.5 * (Math.sqrt(3) - 1);
const UNSKEW = (3 - Math.sqrt(3)) / 6;

// 16 unit-length gradient directions at 22.5-degree steps, written as literals so no trig runs
// at startup. Equal lengths and even angles keep the noise free of the diagonal streaks an
// "axes + diagonals" gradient set produces.
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

// Scales the sum of the three corner contributions so the output spans about [-1, 1].
const OUTPUT_SCALE = 99;

/** Std-dev of one octave of this noise (measured over ~18M samples). Used to normalise sums of octaves. */
export const SIMPLEX_STD = 0.5393;

/**
 * Seeded 2D simplex noise, output within [-1, 1].
 *
 * Deterministic across JS engines: it uses only + - * /, Math.floor and Math.sqrt
 * (all exactly specified), and no sin/cos or Math.random.
 * `salt` gives each noise layer an independent permutation from the same world seed.
 */
export class Simplex2D {
  /** Shuffled 0..255, repeated twice so lookups like perm[i + perm[j]] need no wrapping. */
  private readonly perm = new Uint8Array(512);

  constructor(seed: number, salt = 0) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates shuffle driven by hash(), not a shared RNG, so order of construction never matters.
    for (let i = 255; i > 0; i--) {
      const j = hash(seed, salt, i) % (i + 1);
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  noise(x: number, z: number): number {
    const perm = this.perm;

    // 1. Find which skewed grid cell (i, j) the point is in, and its offset from the cell origin.
    const skew = (x + z) * SKEW;
    const i = Math.floor(x + skew);
    const j = Math.floor(z + skew);
    const unskew = (i + j) * UNSKEW;
    const x0 = x - (i - unskew);
    const z0 = z - (j - unskew);

    // 2. A cell is two triangles. Pick the one containing the point; that decides the 2nd corner.
    const i1 = x0 > z0 ? 1 : 0;
    const j1 = 1 - i1;
    const x1 = x0 - i1 + UNSKEW;          // offset from the 2nd corner
    const z1 = z0 - j1 + UNSKEW;
    const x2 = x0 - 1 + 2 * UNSKEW;       // offset from the 3rd corner
    const z2 = z0 - 1 + 2 * UNSKEW;

    // 3. Pick a pseudo-random gradient for each of the three corners.
    const ii = i & 255;
    const jj = j & 255;
    const g0 = perm[ii + perm[jj]] & 15;
    const g1 = perm[ii + i1 + perm[jj + j1]] & 15;
    const g2 = perm[ii + 1 + perm[jj + 1]] & 15;

    // 4. Sum each corner's contribution: a radial falloff times (gradient . offset).
    let sum = 0;
    let t = 0.5 - x0 * x0 - z0 * z0;
    if (t > 0) { t *= t; sum += t * t * (GRAD_X[g0] * x0 + GRAD_Z[g0] * z0); }
    t = 0.5 - x1 * x1 - z1 * z1;
    if (t > 0) { t *= t; sum += t * t * (GRAD_X[g1] * x1 + GRAD_Z[g1] * z1); }
    t = 0.5 - x2 * x2 - z2 * z2;
    if (t > 0) { t *= t; sum += t * t * (GRAD_X[g2] * x2 + GRAD_Z[g2] * z2); }
    return OUTPUT_SCALE * sum;
  }
}
