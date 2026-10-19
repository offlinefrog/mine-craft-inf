import { SEA_LEVEL, WORLD_HEIGHT } from "../../config";
import { OctaveNoise3, type Octave3Config } from "../../noise/perlin3";
import { Spline, type SplinePoint } from "../../noise/spline";
import type { ClimateSample } from "../../world/climate";

// density lattice, vanilla sized
export const CELL_W = 4;
export const CELL_H = 8;

/**
 *  density(x, y, z) = squeeze(factor * (offset - y)) + strength * jaggedness * noise(x, y, z)
 *  density > 0 = solid
 * 
 *  offset:     surface height with no noise (base height)
 *  factor:     slope of squeeze             (bias)        - high = flat, sharp surface; low = far reaching noise
 *  jaggedness: per-column noise multiplier  (noise scale) - high = spiky/overhang
 * 
 *  surface moves at about (strength * jaggedness / factor) blocks per standard deviation of noise.
 *  all three come from continentalness, erosion, and peaks/valleys climate-sourced not biome-sourced
 */
export interface TerrainConfig {
    seaLevel: number;
    noise: Octave3Config & { strength: number };

    // offset (base height)
    c: SplinePoint[];           // continentalness: ground height on flat land (ocean floor to inland)
    offset: SplinePoint[];      // erosion: blocks added to ground height (zero or negative)
    inland: SplinePoint[];      // continentalness: 0 at sea/coast, 1 at inland; scales eOffset and jaggedness
    hill: SplinePoint[];        // continentalness: max hill rise
    mass: SplinePoint[];        // erosion: fraction of hill forming broad mass of hills
    scale: SplinePoint[];       // erosion: fraction of hill the ridge shape adds or removes (high at low erosion)
    ridge: SplinePoint[];       // pv: ridge shape in [-1, 1] (negative lowers ground, +1 = peak)

    // rivers: weight (0..1) by which a channel is cut into the terrain
    cRiver: SplinePoint[];
    eRiver: SplinePoint[];
    pvRiver: SplinePoint[];
    bed: number;                // river bed height relative to sea level
    depth: number;              // max cut depth to avoid rivers becoming canyons

    // factor (bias)
    eBias: SplinePoint[];       // erosion: squeeze strength
    pvBias: SplinePoint[];      // pv: bias multiplier

    // jaggedness (noise scale)
    eNoise: SplinePoint[];      // erosion: noise multiplier (high at low erosion)
    pvNoise: SplinePoint[];     // pv: extra multiplier on peaks, scaled by inland spline

    factorNegative: number;     // density above surface multiplier (vanilla quarter_negative: 0.25)
    topSlide: number;           // blocks below world top over which density fades to air (negative)
}

export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
    seaLevel: SEA_LEVEL,
    // finest octave: 32 blocks xz, 16 blocks y (minimum 4x8 lattice can resolve)
    noise: { wavelengthXZ: 128, wavelengthY: 64, amplitudes: [1, 1, 1], strength: 0.2 },
    
    c:       [[-1,   32], [-0.455,  42], [-0.19, 58], [-0.11, 65], [0.03,  71], [0.3, 75], [1, 78]],
    offset:  [[-1,    0], [-0.375,  -1], [ 0.05, -4], [ 0.45, -8], [1,    -10]],
    inland:  [[-0.19, 0], [ 0.03, 1]],
    hill:    [[-0.11, 0], [ 0.03, 12], [0.3, 45], [1, 75]],
    mass:    [[-1,     0.75], [-0.78, 0.65], [-0.375, 0.350], [-0.2225, 0.20], [0.05, 0.080], [0.45, 0.02], [1, 0]],
    scale:   [[-1,     0.10], [-0.78, 0.09], [-0.375, 0.065], [-0.2225, 0.05], [0.05, 0.025], [0.45, 0.01], [1, 0.004]],
    ridge:   [[-1.01, -0.45], [-1,   -0.45], [-0.85, -0.350], [-0.2,   -0.05], [0.2,  0.200], [0.7,  0.72], [0.92, 0.96], [1, 1], [1.01, 1]],

    cRiver:  [[-0.19,  0], [-0.11, 1]],
    eRiver:  [[-0.375, 0], [ 0.05, 1]],
    pvRiver: [[-0.6,   0], [-0.85, 0.45], [-0.94, 1], [-1, 1]],
    bed: 3,
    depth: 24,

    eBias:  [[-1, 0.075], [-0.375, 0.085], [0.05, 0.1], [0.45, 0.12], [1, 0.14]],
    pvBias: [[-1, 1.15], [0, 1], [1, 0.9]],

    // initial values (tune): rugged terrain ~2.5x noise, peaks up to ~2.5x more
    eNoise:  [[-1, 2.5], [-0.375, 1.5], [0.05, 1], [0.45, 0.7], [1, 0.6]],
    pvNoise: [[0.4, 0], [0.7, 1], [1, 1.5]],

    factorNegative: 0.25,
    topSlide: 48,
}

export interface TerrainShape { offset: number; factor: number; jaggedness: number; }
export const newTerrainShape = (): TerrainShape => ({ offset: 0, factor: 1, jaggedness: 1 });

const curve = (points: SplinePoint[]) => new Spline(points, { flatEnds: true });

export class TerrainSource {
    private readonly c: Spline;
    private readonly offset: Spline;
    private readonly inland: Spline;
    private readonly hill: Spline;
    private readonly mass: Spline;
    private readonly scale: Spline;
    private readonly ridge: Spline;

    private readonly cRiver: Spline;
    private readonly eRiver: Spline;
    private readonly pvRiver: Spline;

    private readonly eBias: Spline;
    private readonly pvBias: Spline;
    private readonly eNoise: Spline;
    private readonly pvNoise: Spline;

    private readonly noise: OctaveNoise3;
    private readonly bound: number;
    private readonly bed: number;

    readonly config: TerrainConfig;
    readonly seaLevel: number;

    constructor(seed: number, config: TerrainConfig = DEFAULT_TERRAIN_CONFIG) {
        this.c = curve(config.c);
        this.offset = curve(config.offset);
        this.inland = curve(config.inland);
        this.hill = curve(config.hill);
        this.mass = curve(config.mass);
        this.scale = curve(config.scale);
        this.ridge = curve(config.ridge);

        this.cRiver = curve(config.cRiver);
        this.eRiver = curve(config.eRiver);
        this.pvRiver = curve(config.pvRiver.slice().sort((a, b) => a[0] - b[0]));

        this.eBias = curve(config.eBias);
        this.pvBias = curve(config.pvBias);
        this.eNoise = curve(config.eNoise);
        this.pvNoise = curve(config.pvNoise);

        this.noise = new OctaveNoise3(seed, 20, config.noise);
        this.bound = this.noise.maxAbs;
        this.bed = config.seaLevel - config.bed;

        this.config = config;
        this.seaLevel = config.seaLevel;
    }

    // surface height, squeeze, noise strength for a column depending only on climate sample
    shape(s: ClimateSample, out: TerrainShape = newTerrainShape()) {
        const C = s.continentalness, E = s.erosion, PV = s.peaksValleys;
        const land = this.inland.eval(C);

        const hills = this.hill.eval(C) * (this.mass.eval(E) + this.scale.eval(E) * this.ridge.eval(PV));
        let height = this.c.eval(C) + this.offset.eval(E) * land + hills;

        const river = this.pvRiver.eval(PV) * this.cRiver.eval(C) * this.eRiver.eval(E);
        height -= river * Math.max(0, Math.min(this.config.depth, height - this.bed));

        out.offset = height;
        out.factor = this.eBias.eval(E) * this.pvBias.eval(PV);
        out.jaggedness = this.eNoise.eval(E) * (1 + this.pvNoise.eval(PV) * land);
    }

    // density at world pos (wx, wy, wz) for a column with a known shape (> 0 -> solid)
    density(wx: number, wy: number, wz: number, s: TerrainShape): number {
        let d = s.factor * (s.offset - wy);
        if (d < 0) d *= this.config.factorNegative; // vanilla quarter_negative

        // noise bounded: far from surface sign cannot change -> skip Perlin eval
        const amp = this.config.noise.strength * s.jaggedness;
        if (Math.abs(d) <= amp * this.bound) d += amp * this.noise.sample(wx, wy, wz);

        // fade to air near WORLD_HEIGHT
        const slide = this.config.topSlide, fromTop = WORLD_HEIGHT - wy;
        if (fromTop < slide) {
            const t = Math.max(0, fromTop) / slide;
            d = -1 + (d + 1) * t;
        }
        return d;
    }
}
