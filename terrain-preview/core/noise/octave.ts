import { Simplex2D, SIMPLEX_STD } from "./simplex";

/**
 * Describes a sum of simplex octaves, in the style of Minecraft's climate noises.
 * Octave i has wavelength `wavelength / 2^i` and weight `amplitudes[i] * 0.5^i`, so an
 * amplitude of 1 is the ordinary "half the strength per octave" fall-off, 2 doubles an octave,
 * and 0 skips it. Skipping octaves is how a parameter keeps broad zones without mid-scale detail.
 */
export interface OctaveConfig {
  /** Wavelength of the first (coarsest) octave, in blocks. Larger = broader features. */
  wavelength: number;
  amplitudes: readonly number[];
}

// Each octave is rotated by a different angle (golden-angle steps) so octaves don't share the
// noise lattice's orientation; this removes the faint directional streaking a single orientation
// produces. Written as literals, so no trig runs and results are identical on every engine.
const ROTATION_COS = [
  1, -0.7373688780783197, 0.0874257247169599, 0.6084388609788626,
  -0.9847134853154287, 0.8437552948123972, -0.2596043049014886, -0.4609070247133692,
  0.9393212963241181, -0.9243455561378048, 0.4238459950479107, 0.2992838644448729,
];
const ROTATION_SIN = [
  0, 0.6754902942615238, -0.9961710408648278, 0.7936007512916959,
  -0.1741819503793116, -0.5367280526263227, 0.9657150743757783, -0.8874484292452546,
  0.343038630874102, 0.3815564084749363, -0.9057342725556136, 0.954164120307897,
];

interface Octave {
  noise: Simplex2D;   // each octave has its own permutation table, so octaves are uncorrelated
  frequency: number;  // 1 / wavelength
  weight: number;     // already includes the normalisation to unit std-dev
  cos: number;        // this octave's rotation
  sin: number;
}

/**
 * Sum of rotated simplex octaves, scaled to unit standard deviation (roughly -3..3, mostly
 * -2..2). Callers multiply by a `spread` to choose how much of [-1, 1] it fills.
 * Always sampled in world coordinates.
 */
export class OctaveNoise {
  private readonly octaves: Octave[] = [];

  /** `salt` gives this noise its own random layout from the shared world seed. */
  constructor(seed: number, salt: number, config: OctaveConfig) {
    let sumSq = 0;
    config.amplitudes.forEach((amplitude, i) => {
      if (amplitude === 0) return;
      const weight = amplitude * Math.pow(0.5, i);
      sumSq += weight * weight;
      this.octaves.push({
        noise: new Simplex2D(seed, salt * 64 + i),
        frequency: Math.pow(2, i) / config.wavelength,
        weight,
        cos: ROTATION_COS[i % ROTATION_COS.length],
        sin: ROTATION_SIN[i % ROTATION_SIN.length],
      });
    });
    // Independent octaves add in variance, so total std = SIMPLEX_STD * sqrt(sum of weight^2).
    const unitScale = 1 / (SIMPLEX_STD * Math.sqrt(sumSq));
    for (const o of this.octaves) o.weight *= unitScale;
  }

  sample(x: number, z: number): number {
    let sum = 0;
    for (const o of this.octaves) {
      const rx = x * o.cos - z * o.sin;
      const rz = x * o.sin + z * o.cos;
      sum += o.weight * o.noise.noise(rx * o.frequency, rz * o.frequency);
    }
    return sum;
  }
}
