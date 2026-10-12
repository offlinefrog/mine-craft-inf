import { Simplex2D, SIMPLEX_SD } from "./simplex";

/**
 * sum of simplex octaves; octave i has
 *  wavelength: wavelength / 2^i
 *  weight: amplitude[i] * 0.5^i
 * amplitude 1: half strength per octave; 2: double; 0: skip
 *  skip to keep broad zones without mid-scale detail
*/
export interface OctaveConfig {
    // larger wavelength = broader features
    wavelength: number;
    amplitudes: readonly number[];
}

// golden-angle step rotations
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
    noise: Simplex2D;
    frequency: number;
    weight: number;
    cos: number;
    sin: number;
}

// sum of rotated simplex octaves, scaled to unit sd
export class OctaveNoise {
    private readonly octaves: Octave[] = [];

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
        // independent octaves add variance
        const unitScale = 1 / (SIMPLEX_SD * Math.sqrt(sumSq));
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
