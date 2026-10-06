import { CLIMATE_DIMENSIONS, type ClimateDimension } from "../world/climate";
import { OctaveNoise, type OctaveConfig } from "../core/octave";

interface DimensionConfig extends OctaveConfig {
    // sd of final value before bind to [-1, 1]
    spread: number;
    // additive climate-space offset before bind to [-1, 1]
    offset?: number;
}

interface WarpConfig extends OctaveConfig {
    // sd of coordinate displacement
    strength: number;
}

export interface ClimateConfig {
    dimensions: Record<ClimateDimension, DimensionConfig>;
    warp: WarpConfig;
}

// default octave patterns
export const DEFAULT_CLIMATE_CONFIG: ClimateConfig = {
    dimensions: {
        temperature:     { wavelength: 1024, amplitudes: [1.5, 0, 1, 0, 0, 0],        spread: 0.54 },
        humidity:        { wavelength: 256,  amplitudes: [1, 1, 0, 0, 0, 0],          spread: 0.48 },
        continentalness: { wavelength: 512, amplitudes: [1, 1, 2, 2, 2, 1, 1, 1, 1],  spread: 0.43 },
        erosion:         { wavelength: 512,  amplitudes: [1, 1, 0, 1, 1],             spread: 0.47 },
        weirdness:       { wavelength: 128,  amplitudes: [1, 2, 1, 0, 0, 0],          spread: 0.45 },
    },
    warp: { wavelength: 256, amplitudes: [1, 1, 1, 1], strength: 16 },
};

// PV = 1 - |( 3 * | w |) - 2 |
const pv = (w: number): number => 1 - Math.abs((3 * Math.abs(w)) - 2);

export type ClimateSample = Record<ClimateDimension, number> & { PV: number };
export const newClimateSample = (): ClimateSample => ({
    temperature: 0, humidity: 0, continentalness: 0, erosion: 0, weirdness: 0, PV: 0
});

const bind = (v: number): number => (v < -1 ? -1 : v > 1 ? 1 : v);

export class ClimateSampler {
    private readonly noise = {} as Record<ClimateDimension, OctaveNoise>;
    private readonly warpX: OctaveNoise;
    private readonly warpZ: OctaveNoise;

    private readonly config: ClimateConfig;

    constructor(seed: number, config: ClimateConfig = DEFAULT_CLIMATE_CONFIG) {
        // incrementally-salted noises
        CLIMATE_DIMENSIONS.forEach((p, i) => { this.noise[p] = new OctaveNoise(seed, i + 1, config.dimensions[p]); });
        this.warpX = new OctaveNoise(seed, CLIMATE_DIMENSIONS.length + 1, config.warp);
        this.warpZ = new OctaveNoise(seed, CLIMATE_DIMENSIONS.length + 2, config.warp);

        this.config = config;
    }

    // sampled at world coords (wx, wz)
    sample(wx: number, wz: number, out: ClimateSample = newClimateSample()): ClimateSample {
        const { dimensions, warp } = this.config;
        let x = wx, z = wz;

        if (warp.strength !== 0) {
            x = wx + this.warpX.sample(wx, wz) * warp.strength;
            z = wz + this.warpZ.sample(wx, wz) * warp.strength;
        }

        for (const p of CLIMATE_DIMENSIONS) {
            const dimension = dimensions[p];
            out[p] = bind(this.noise[p].sample(x, z) * dimension.spread);
        }
        out.PV = pv(out.weirdness);
        return out;
    }
}
