import { OctaveNoise3, type Octave3Config } from "../core/noise/perlin3";
import { Spline, type SplinePoint } from "../core/spline";
import { SEA_LEVEL } from "../world/chunk";
import type { ClimateSample } from "./climate";

/*
 * Terrain shape, after Minecraft's density approach:
 *
 *     density(x, y, z) = bias(x, z) * (baseHeight(x, z) - y)  +  amplitude * noise3D(x, y, z)
 *
 * A block is solid where density > 0.
 *  - baseHeight is the height at which the squeeze term is zero: raising it lifts the ground.
 *  - bias is how hard the squeeze is, in density per block. A high bias gives a sharp, nearly flat
 *    surface; a low bias lets the 3D noise reach far above and below baseHeight, which makes
 *    overhangs, cliffs and arches. Noise reaches roughly amplitude / bias blocks from baseHeight.
 *  - Both come from splines of the climate: continentalness, erosion and peaks-and-valleys, the same
 *    values that choose biomes, so terrain and biomes agree.
 */

export interface TerrainConfig {
  /** Water fills air below this y. */
  seaLevel: number;
  /** The 3D noise, and its strength in density units. */
  noise: Octave3Config & { amplitude: number };

  /** Continentalness -> ground height on flat land (blocks): the ocean floor rising to the interior. */
  continental: SplinePoint[];
  /** Erosion -> blocks added to the ground height (zero or negative): higher erosion means lower ground. */
  erosionOffset: SplinePoint[];
  /** Continentalness -> 0 at sea and coast, 1 well inland. Scales erosionOffset so the sea floor is unaffected. */
  inland: SplinePoint[];
  /** Continentalness -> how many blocks hills can rise above that (at the lowest erosion, highest peaks). */
  hillHeight: SplinePoint[];
  /**
   * Erosion -> fraction of hillHeight that forms the broad mass of the hills and mountains. It varies
   * only with erosion and continentalness, which change slowly, so it gives wide, gently sloping
   * massifs rather than spires.
   */
  massByErosion: SplinePoint[];
  /** Erosion -> fraction of hillHeight added by the ridge pattern (peaks-and-valleys) on top of the mass. */
  erosionScale: SplinePoint[];
  /**
   * Peaks-and-valleys -> ridge shape in [-1, 1]: negative lowers the ground, +1 is a full crest. It is
   * flat at both ends (zero slope at PV = -1 and +1), so crests and valley floors are rounded, not creased.
   */
  ridgeShape: SplinePoint[];

  /** Rivers: weight (0..1) with which a channel is cut into the ground, as three factors multiplied. */
  riverByPV: SplinePoint[];
  riverByContinentalness: SplinePoint[];
  riverByErosion: SplinePoint[];
  /** River bed height relative to sea level (blocks). Channels are cut down toward it... */
  riverBedBelowSea: number;
  /** ...but never deeper than this many blocks, so rivers are channels, not canyons. */
  riverMaxDepth: number;

  /** Erosion -> squeeze strength (density per block). Multiplied by biasByPV. */
  biasByErosion: SplinePoint[];
  biasByPV: SplinePoint[];
}

export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  seaLevel: SEA_LEVEL,
  // Wavelengths stay well above 8 blocks, the Nyquist limit of the 4-block sampling grid.
  noise: { wavelengthXZ: 64, wavelengthY: 40, octaves: 3, amplitude: 0.2 },

  // Heights are for a 256-block world with sea level 64. Flat inland ground sits ~8-14 blocks above sea
  // (a little higher where erosion is low), as in Minecraft, so a valley can reach the water with a shallow
  // cut. Hills supply the height: up to ~130 blocks above the flats, so peaks reach about y=210.
  continental: [[-1, 26], [-0.455, 38], [-0.19, 54], [-0.11, 61], [0.03, 69], [0.3, 74], [1, 78]],
  erosionOffset: [[-1, 0], [-0.375, -1], [0.05, -4], [0.45, -8], [1, -10]],
  inland: [[-0.19, 0], [0.03, 1]],
  hillHeight: [[-0.11, 0], [0.03, 24], [0.3, 80], [1, 130]],
  // About 90% of a mountain's height is the smooth mass, 10% (up to ~13 blocks) is the ridge pattern on top of it.
  // PV changes every ~50 blocks, so a larger ridge amplitude would be a cliff, not a ridge.
  massByErosion: [[-1, 0.9], [-0.78, 0.83], [-0.375, 0.5], [-0.2225, 0.32], [0.05, 0.1], [0.45, 0.025], [1, 0]],
  erosionScale: [[-1, 0.1], [-0.78, 0.09], [-0.375, 0.065], [-0.2225, 0.05], [0.05, 0.025], [0.45, 0.01], [1, 0.004]],
  ridgeShape: [[-1.01, -0.45], [-1, -0.45], [-0.85, -0.35], [-0.2, -0.05], [0.2, 0.2], [0.7, 0.72], [0.92, 0.96], [1, 1], [1.01, 1]],

  // The cut spans PV -0.6..-0.94 so banks slope gently; PV < -0.85 is the valley level the biome table calls River.
  riverByPV: [[-0.6, 0], [-0.85, 0.45], [-0.94, 1], [-1, 1]],
  riverByContinentalness: [[-0.19, 0], [-0.11, 1]],
  riverByErosion: [[-0.375, 0], [0.05, 1]],
  riverBedBelowSea: 3,
  riverMaxDepth: 24,

  // A firm squeeze everywhere keeps slopes natural: the 3D noise only reaches amplitude / bias, i.e. ~4 blocks
  // per unit of noise at the weakest squeeze (0.075 x 0.9).
  biasByErosion: [[-1, 0.075], [-0.375, 0.085], [0.05, 0.1], [0.45, 0.12], [1, 0.14]],
  biasByPV: [[-1, 1.15], [0, 1], [1, 0.9]],
};

/** Where the ground is and how hard it is squeezed, for one (x, z) column. */
export interface TerrainShape {
  baseHeight: number;
  bias: number;
  /** Multiplies the 3D noise: 1 normally, lower where overhangs and cliffs are unwelcome (see clearance.ts). */
  noiseScale: number;
}
export const newTerrainShape = (): TerrainShape => ({ baseHeight: 0, bias: 1, noiseScale: 1 });

export class TerrainSampler {
  private readonly continental: Spline;
  private readonly erosionOffset: Spline;
  private readonly inland: Spline;
  private readonly hillHeight: Spline;
  private readonly massByErosion: Spline;
  private readonly erosionScale: Spline;
  private readonly ridgeShape: Spline;
  private readonly riverByPV: Spline;
  private readonly riverByC: Spline;
  private readonly riverByE: Spline;
  private readonly biasByErosion: Spline;
  private readonly biasByPV: Spline;
  private readonly noise: OctaveNoise3;
  private readonly riverBed: number;

  readonly config: TerrainConfig;

  constructor(seed: number, config: TerrainConfig = DEFAULT_TERRAIN_CONFIG) {
    this.continental = new Spline(config.continental);
    this.erosionOffset = new Spline(config.erosionOffset);
    this.inland = new Spline(config.inland);
    this.hillHeight = new Spline(config.hillHeight);
    this.massByErosion = new Spline(config.massByErosion);
    this.erosionScale = new Spline(config.erosionScale);
    this.ridgeShape = new Spline(config.ridgeShape);
    this.riverByPV = new Spline(config.riverByPV.slice().sort((a, b) => a[0] - b[0]));
    this.riverByC = new Spline(config.riverByContinentalness);
    this.riverByE = new Spline(config.riverByErosion);
    this.biasByErosion = new Spline(config.biasByErosion);
    this.biasByPV = new Spline(config.biasByPV);
    this.noise = new OctaveNoise3(seed, 20, config.noise);
    this.riverBed = config.seaLevel - config.riverBedBelowSea;
  
    this.config = config;
  }

  /**
   * The ground height and squeeze for a column, from its climate `c`. Continentalness and erosion are read
   * from `smooth` when given (a slowly varying version, so mountains are broad massifs); peaks-and-valleys
   * always comes from `c`, so ridges and rivers stay aligned with the biome table.
   */
  shape(c: ClimateSample, out: TerrainShape = newTerrainShape(), smooth: ClimateSample = c): TerrainShape {
    const C = smooth.continentalness, E = smooth.erosion, PV = c.peaksValleys;
    const hills = this.hillHeight.eval(C) * (this.massByErosion.eval(E) + this.erosionScale.eval(E) * this.ridgeShape.eval(PV));
    let height = this.continental.eval(C) + this.erosionOffset.eval(E) * this.inland.eval(C) + hills;
    const river = this.riverByPV.eval(PV) * this.riverByC.eval(C) * this.riverByE.eval(E);
    height -= river * Math.max(0, Math.min(this.config.riverMaxDepth, height - this.riverBed));   // cut a channel toward the river bed
    out.baseHeight = height;
    out.bias = this.biasByErosion.eval(E) * this.biasByPV.eval(PV);
    out.noiseScale = 1;
    return out;
  }

  /** Density at a point (positive = solid) for a column whose shape is already known. */
  density(wx: number, wy: number, wz: number, shape: TerrainShape): number {
    return shape.bias * (shape.baseHeight - wy) + this.config.noise.amplitude * shape.noiseScale * this.noise.sample(wx, wy, wz);
  }
}
