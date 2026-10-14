import { OctaveNoise, type OctaveConfig } from "../noise/octave";
import { AXES, type Axis, type ClimateSample } from "../world/climate";

interface AxisConfig extends OctaveConfig {
    spread: number; // sd of final value before bind to [-1, 1]
    offset?: number; // additive climate-space offset before bind
}

interface WarpConfig extends OctaveConfig {
    strength: number; // sd of coordinate displacement
}

const SAMPLE_AXES = [
    "temperature",
    "humidity",
    "continentalness",
    "erosion",
    "weirdness",
] as const satisfies readonly Axis[];
type SampleAxis = Exclude<Axis, "peaksValleys">;

export interface ClimateConfig {
    axes: Record<SampleAxis, AxisConfig>;
    warp: WarpConfig;
}

export const DEFAULT_CLIMATE_CONFIG: ClimateConfig = {
    axes: {
        temperature:     { wavelength: 768,  amplitudes: [1.5, 0, 0.75],  spread: 0.54 },
        humidity:        { wavelength: 384,  amplitudes: [1, 0.75],       spread: 0.48 },
        continentalness: { wavelength: 1536, amplitudes: [1, 0.50, 0.25], spread: 0.60 },
        erosion:         { wavelength: 384,  amplitudes: [1, 0.75, 0.25], spread: 0.45 },
        weirdness:       { wavelength: 384,  amplitudes: [1, 0.75, 0.25], spread: 0.38 },
    },
    warp: { wavelength: 384, amplitudes: [1, 0.5], strength: 12 }
}

export const newClimateSample = (): ClimateSample => ({
    temperature: 0, humidity: 0, continentalness: 0, erosion: 0, weirdness: 0, peaksValleys: 0
});

const pv = (w: number): number => 1 - Math.abs((3 * Math.abs(w)) - 2);

export class ClimateSource {
    private readonly noises = {} as Record<SampleAxis, OctaveNoise>;
    private readonly warpX: OctaveNoise;
    private readonly warpZ: OctaveNoise;

    private readonly config: ClimateConfig;

    constructor(seed: number, config: ClimateConfig = DEFAULT_CLIMATE_CONFIG) {
        SAMPLE_AXES.forEach((a, i) => { this.noises[a] = new OctaveNoise(seed, i + 1, config.axes[a]); });
        this.warpX = new OctaveNoise(seed, AXES.length + 1, config.warp);
        this.warpZ = new OctaveNoise(seed, AXES.length + 2, config.warp);

        this.config = config;
    }

    sample(wx: number, wz: number, out: ClimateSample) {
        const { axes, warp } = this.config;
        let x = wx, z = wz;

        if (warp.strength !== 0) {
            x = wx + this.warpX.sample(wx, wz) * warp.strength;
            z = wz + this.warpZ.sample(wx, wz) * warp.strength;
        }

        for (const a of SAMPLE_AXES) {
            const axis = axes[a];
            out[a] = this.noises[a].sample(x, z) * axis.spread + (axis.offset ?? 0);
        }

        out.peaksValleys = pv(out.weirdness);
    }
}
