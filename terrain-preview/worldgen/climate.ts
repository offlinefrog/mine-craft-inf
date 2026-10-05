import { OctaveNoise, type OctaveConfig } from "../core/noise/octave";

/** The five noise-driven biome parameters, each in [-1, 1]. */
export const CLIMATE_PARAMS = [
  "temperature", "humidity", "continentalness", "erosion", "weirdness",
] as const;
export type ClimateParam = (typeof CLIMATE_PARAMS)[number];

export interface ParamConfig extends OctaveConfig {
  /**
   * Std-dev of the final value before clamping to [-1, 1]. Calibrated per parameter so the 99th
   * percentile of |value| is about 1: the full range the biome table and splines are written
   * over is used, and only ~1% of columns hit the clamp. Different octave patterns have
   * different tails, hence one value each. Recompute with `tsx src/tools/calibrateClimate.ts`
   * after changing a wavelength or amplitude list.
   */
  spread: number;
}

export interface WarpConfig extends OctaveConfig {
  /** Std-dev of the coordinate displacement, in blocks. 0 disables the warp. */
  strength: number;
}

export interface ClimateConfig {
  params: Record<ClimateParam, ParamConfig>;
  /** One shared warp, applied to the sampling position of every parameter. Roughens region borders. */
  warp: WarpConfig;
}

/**
 * Octave patterns follow Minecraft 1.18's climate noises (the temperature, continentalness and
 * erosion patterns were confirmed against a source; humidity and weirdness are from memory):
 *  - temperature: broad zones only, almost no fine detail
 *  - humidity: mid-size patches
 *  - continentalness: strong at 128-256 blocks, giving detailed coastline-like boundaries
 *  - erosion: broad plus fine, with a gap at 128 blocks
 *  - weirdness: short wavelength, so peaks-and-valleys ridge lines recur often
 */
export const DEFAULT_CLIMATE_CONFIG: ClimateConfig = {
  params: {
    temperature:     { wavelength: 1024, amplitudes: [1.5, 0, 1, 0, 0, 0],        spread: 0.54 },
    humidity:        { wavelength: 256,  amplitudes: [1, 1, 0, 0, 0, 0],          spread: 0.48 },
    continentalness: { wavelength: 512,  amplitudes: [1, 1, 2, 2, 2, 1, 1, 1, 1], spread: 0.43 },
    erosion:         { wavelength: 512,  amplitudes: [1, 1, 0, 1, 1],             spread: 0.47 },
    weirdness:       { wavelength: 128,  amplitudes: [1, 2, 1, 0, 0, 0],          spread: 0.45 },
  },
  warp: { wavelength: 256, amplitudes: [1, 1, 1, 1], strength: 16 },
};

/**
 * A copy of `config` that keeps only octaves whose wavelength is at least `minWavelength` (always keeping the
 * coarsest one). The result varies slowly, which is what terrain heights need: fine detail in continentalness
 * or erosion, multiplied by a spline that turns it into up to 130 blocks of height, makes cliffs.
 */
export function smoothClimateConfig(config: ClimateConfig, minWavelength: number): ClimateConfig {
  const coarse = <T extends OctaveConfig>(c: T): T => {
    const amplitudes = c.amplitudes.map((a, i) => (i === 0 || c.wavelength / 2 ** i >= minWavelength ? a : 0));
    return { ...c, amplitudes };
  };
  const params = {} as ClimateConfig["params"];
  for (const p of CLIMATE_PARAMS) params[p] = coarse(config.params[p]);
  return { params, warp: coarse(config.warp) };
}

/**
 * Peaks and valleys, "ridges folded": 1 - |3|w| - 2|. It is -1 at w = 0 (valleys), +1 at
 * |w| = 2/3 (peaks) and 0 at |w| = 1. The third spline input. It discards the sign of w.
 */
export const peaksAndValleys = (w: number): number => 1 - Math.abs(3 * Math.abs(w) - 2);

/** All climate values at one column. */
export type ClimateSample = Record<ClimateParam, number> & { peaksValleys: number };

export const newClimateSample = (): ClimateSample => ({
  temperature: 0, humidity: 0, continentalness: 0, erosion: 0, weirdness: 0, peaksValleys: 0,
});

const clampUnit = (v: number): number => (v < -1 ? -1 : v > 1 ? 1 : v);

export class ClimateSampler {
  private readonly noise = {} as Record<ClimateParam, OctaveNoise>;
  private readonly warpX: OctaveNoise;
  private readonly warpZ: OctaveNoise;

  readonly config: ClimateConfig;

  constructor(seed: number, config: ClimateConfig = DEFAULT_CLIMATE_CONFIG) {
    // Each parameter gets its own salt, so all five are independent noises from the one seed.
    CLIMATE_PARAMS.forEach((p, i) => { this.noise[p] = new OctaveNoise(seed, i + 1, config.params[p]); });
    this.warpX = new OctaveNoise(seed, CLIMATE_PARAMS.length + 1, config.warp);
    this.warpZ = new OctaveNoise(seed, CLIMATE_PARAMS.length + 2, config.warp);
  
    this.config = config;
  }

  /** Raw unit-std noise for one parameter: no warp, no spread, no clamp. Used for calibration and tests. */
  unitSample(param: ClimateParam, wx: number, wz: number): number {
    return this.noise[param].sample(wx, wz);
  }

  /**
   * The climate at world position (wx, wz). A pure function of (seed, config, wx, wz): it knows
   * nothing about chunks. Pass `out` to reuse an object in hot loops instead of allocating.
   */
  sample(wx: number, wz: number, out: ClimateSample = newClimateSample()): ClimateSample {
    const { params, warp } = this.config;
    let x = wx, z = wz;
    if (warp.strength !== 0) {
      x = wx + this.warpX.sample(wx, wz) * warp.strength;
      z = wz + this.warpZ.sample(wx, wz) * warp.strength;
    }
    for (const p of CLIMATE_PARAMS) out[p] = clampUnit(this.noise[p].sample(x, z) * params[p].spread);
    out.peaksValleys = peaksAndValleys(out.weirdness);
    return out;
  }
}
