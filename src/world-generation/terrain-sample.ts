import { SEA_LEVEL } from "../config";
import type { ClimateSample } from "./climate-sample";
import { OctaveNoise3, type Octave3Config } from "../core/perlin3";
import { Spline, type SplinePoint } from "../core/spline";

/**
 *  terrain shape with minecraft's density:
 *      density(x, y, z) = bias(x, z) * (baseHeight(x, z) - y) + amplitude * 3Dnoise(x, y, z)
 *  density > 0: solid block
 *  
 *  baseHeight: value at which 'squeeze' is zero (no bias effect on density)
 *  bias: magnitude of 'squeeze'; high -> sharp, flat surface, low -> 3Dnoise reaches farther above/below baseHeight
 *  
 *  noise reaches (amplitude / bias) blocks from baseHeight
 *  both baseHeight and bias come from climate splines (continentalness, erosion, PV)
 */
export interface TerrainConfig {
    seaLevel: number;   // water fills air below this y
    noise: Octave3Config & { amplitude: number };

    continental: SplinePoint[];     // continentalness: ground height on flat land (ocean floor to interior)
    erosionOffset: SplinePoint[];   // erosion: blocks added to ground height (zero/negative)
    inland: SplinePoint[];          // continentalness: 0 at sea/coast, 1 far inland, scales erosionOffset
    hillHeight: SplinePoint[];      // continentalness: range for hills to rise (lowest erosion, highest PV)
    erosionMass: SplinePoint[];     // erosion: portion of hillHeight forming broad mass of hills and mountains
    erosionScale: SplinePoint[];    // erosion: fraction of hillHeight used (low = rugged, high = flat)
    ridgeShape: SplinePoint[];      // PV: hill shape in [-1, 1] (negative lowers ground, +1 = peak)

    // rivers: weight(0..1) by which a channel is cut into the terrain
    pvRiver: SplinePoint[];
    continentalRiver: SplinePoint[];
    erosionRiver: SplinePoint[];
    riverBedBelowSea: number;       // river bed height relative to sea level
    riverMaxDepth: number;          // maximum depth regardless of bed height to avoid rivers becoming canyons

    erosionBias: SplinePoint[];     // erosion: squeeze strength
    pvBias: SplinePoint[];          // PV: erosion bias multiplier
}

export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
    seaLevel: SEA_LEVEL,
    noise: { wavelengthXZ: 64, wavelengthY: 40, octaves: 3, amplitude: 0.2 },

    continental: [[-1, 32], [-0.455, 42], [-0.19, 58], [-0.11, 65], [0.03, 71], [0.3, 75], [1, 78]],
    erosionOffset: [[-1, 0], [-0.375, -1], [0.05, -4], [0.45, -8], [1, -10]],
    inland: [[-0.19, 0], [0.03, 1]],
    hillHeight: [[-0.11, 0], [0.03, 12], [0.3, 45], [1, 75]],
    erosionMass: [[-1, 0.75], [-0.78, 0.65], [-0.375, 0.35], [-0.2225, 0.2], [0.05, 0.08], [0.45, 0.02], [1, 0]],
    erosionScale: [[-1, 0.1], [-0.78, 0.09], [-0.375, 0.065], [-0.2225, 0.05], [0.05, 0.025], [0.45, 0.01], [1, 0.004]],
    ridgeShape: [[-1.01, -0.45], [-1, -0.45], [-0.85, -0.35], [-0.2, -0.05], [0.2, 0.2], [0.7, 0.72], [0.92, 0.96], [1, 1], [1.01, 1]],
    
    pvRiver: [[-0.6, 0], [-0.85, 0.45], [-0.94, 1], [-1, 1]],
    continentalRiver: [[-0.19, 0], [-0.11, 1]],
    erosionRiver: [[-0.375, 0], [0.05, 1]],
    riverBedBelowSea: 3,
    riverMaxDepth: 24,

    erosionBias: [[-1, 0.075], [-0.375, 0.085], [0.05, 0.1], [0.45, 0.12], [1, 0.14]],
    pvBias: [[-1, 1.15], [0, 1], [1, 0.9]],
}

export interface TerrainShape { baseHeight: number; bias: number; noiseScale: number; }
export const newTerrainShape = (): TerrainShape => ({ baseHeight: 0, bias: 1, noiseScale: 1 });

export class TerrainSampler {
    private readonly continental: Spline;
    private readonly erosionOffset: Spline;
    private readonly inland: Spline;
    private readonly erosionMass: Spline;
    private readonly hillHeight: Spline;
    private readonly erosionScale: Spline;
    private readonly ridgeShape: Spline;

    private readonly pvRiver: Spline;
    private readonly continentalRiver: Spline;
    private readonly erosionRiver: Spline;

    private readonly erosionBias: Spline;
    private readonly pvBias: Spline;

    private readonly noise: OctaveNoise3;
    private readonly riverBed: number;

    readonly config: TerrainConfig;

    constructor(seed: number, config: TerrainConfig = DEFAULT_TERRAIN_CONFIG) {
        this.continental = new Spline(config.continental);
        this.erosionOffset = new Spline(config.erosionOffset);
        this.inland = new Spline(config.inland);
        this.erosionMass = new Spline(config.erosionMass);
        this.hillHeight = new Spline(config.hillHeight);
        this.erosionScale = new Spline(config.erosionScale);
        this.ridgeShape = new Spline(config.ridgeShape);

        this.pvRiver = new Spline(config.pvRiver.slice().sort((a, b) => a[0] - b[0]));
        this.continentalRiver = new Spline(config.continentalRiver);
        this.erosionRiver = new Spline(config.erosionRiver);

        this.erosionBias = new Spline(config.erosionBias);
        this.pvBias = new Spline(config.pvBias);

        this.noise = new OctaveNoise3(seed, 20, config.noise);
        this.riverBed = config.seaLevel - config.riverBedBelowSea;

        this.config = config;
    }

    // ground height and squeeze for a column, based on climate
    shape(c: ClimateSample, out: TerrainShape = newTerrainShape()): TerrainShape {
        const C = c.continentalness, E = c.erosion, PV = c.PV;

        const hills = this.hillHeight.eval(C) * this.erosionMass.eval(E) + this.erosionScale.eval(E) * this.ridgeShape.eval(PV);
        let height = this.continental.eval(C) + this.erosionOffset.eval(E) * this.inland.eval(C) + hills;

        const river = this.pvRiver.eval(PV) * this.continentalRiver.eval(C) * this.erosionRiver.eval(E);
        height -= river * Math.max(0, Math.min(this.config.riverMaxDepth, height - this.riverBed));

        out.baseHeight = height;
        out.bias = this.erosionBias.eval(E) * this.pvBias.eval(PV);
        out.noiseScale = 1;
        return out;
    }

    // density at a tuple of world coordinates for a column with a known shape
    density(wx: number, wy: number, wz: number, shape: TerrainShape): number {
        return shape.bias * (shape.baseHeight - wy) + this.config.noise.amplitude * shape.noiseScale * this.noise.sample(wx, wy, wz);
    }
}
