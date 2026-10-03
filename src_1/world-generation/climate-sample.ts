import { OctaveNoise, type OctaveConfig } from "./noise";

const CLIMATE_PARAMS = [
    'temperature', 'humidity', 'continentalness', 'erosion', 'weirdness',
] as const;
export type ClimateParam = (typeof CLIMATE_PARAMS)[number];

interface ParamConfig extends OctaveConfig {
    // sd of final value before bind to [-1, 1]
    spread: number
}

interface WarpConfig extends OctaveConfig {
    // sd of coordinate displacement
    strength: number
}

export interface ClimateConfig {
    params: Record<ClimateParam, ParamConfig>;
    warp: WarpConfig;
}

// default octave patterns acc to Minecraft noises
export const DEFAULT_CLIMATE_CONFIG: ClimateConfig = {
    params: {
        temperature:        { wavelength: 1024, amplitudes: [1.5, 0, 1, 0, 0, 0],           spread: 0.54 },
        humidity:           { wavelength: 256,  amplitudes: [1, 1, 0, 0, 0, 0],             spread: 0.48 },
        continentalness:    { wavelength: 512,  amplitudes: [1, 1, 2, 2, 2, 1, 1, 1, 1],    spread: 0.43 },
        erosion:            { wavelength: 512,  amplitudes: [1, 1, 0, 1, 1],                spread: 0.47 },
        weirdness:          { wavelength: 128,  amplitudes: [1, 2, 1, 0, 0, 0],             spread: 0.45 },
    },
    warp: { wavelength: 256, amplitudes: [1, 1, 1, 1], strength: 16 }
}

// PV = -3 * || weirdness - 2/3 | - 1/3 |
const peaksAndValleys = (w: number): number => 1 - Math.abs((3 * Math.abs(w)) - 2)

export type ClimateSample = Record<ClimateParam, number> & { PV: number };
const newClimateSample = (): ClimateSample => ({
    temperature: 0, humidity: 0, continentalness: 0, erosion: 0, weirdness: 0, PV: 0,
});

const bindUnit = (v: number): number => (v < -1 ? -1 : v > 1 ? 1 : v);

export class ClimateSampler {
    private readonly noise = {} as Record<ClimateParam, OctaveNoise>;
    private readonly warpX: OctaveNoise;
    private readonly warpZ: OctaveNoise;

    readonly config: ClimateConfig;

    constructor(seed: number, config: ClimateConfig = DEFAULT_CLIMATE_CONFIG) {
        // incrementally-salted noises
        CLIMATE_PARAMS.forEach((p, i) => { this.noise[p] = new OctaveNoise(seed, i + 1, config.params[p]); });
        this.warpX = new OctaveNoise(seed, CLIMATE_PARAMS.length + 1, config.warp);
        this.warpZ = new OctaveNoise(seed, CLIMATE_PARAMS.length + 2, config.warp);

        this.config = config;
    }

    // sampled at world coords (wx, wz)
    sample(wx: number, wz: number): ClimateSample {
        const out = newClimateSample();
        const { params, warp } = this.config;
        let x = wx, z = wz;

        if (warp.strength !== 0) {
            x = wx + this.warpX.sample(wx, wz) * warp.strength;
            z = wz + this.warpZ.sample(wx, wz) * warp.strength;
        }

        for (const p of CLIMATE_PARAMS) out[p] = bindUnit(this.noise[p].sample(x, z) * params[p].spread);
        out.PV = peaksAndValleys(out.weirdness);
        return out;
    }
}
