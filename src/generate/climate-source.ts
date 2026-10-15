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

/**
 * (done) fix SIMPLEX_SD.
 * (done) adjust continentalness spread, offset for less lo-C, more hi-C.
 * raise mid-octave amplitudes to for more irregular coasts
 * (done) raise warp strength for more organic shapes (keep under wavelength / 4)
 * lower wavelengths and add octaves on temp and humidity for more variety
 * increase spread on temp and humidity for more rare biomes
 * (done) raise wavelength on weirdness for slower PV -> larger, smoother rivers and peaks
 * offset weirdness for more/less rare biomes
 * (done) raise wavelength, remove octaves, lower strength of warp for less jaggedness
 */

const DEPRECATED_CLIMATE_CONFIG_1: ClimateConfig = {
    axes: {
        temperature:     { wavelength: 1792, amplitudes: [1, 1.5, 2, 2],         spread: 0.48 },
        humidity:        { wavelength: 1280, amplitudes: [1, 1.5, 1, 0.5],       spread: 0.48 },
        continentalness: { wavelength: 1280, amplitudes: [1, 1.5, 2, 2, 1.5, 1], spread: 0.55, offset: 0.3 },
        erosion:         { wavelength: 1024, amplitudes: [1, 1, 0.25],           spread: 0.38 },
        weirdness:       { wavelength: 1280, amplitudes: [1, 0.5],               spread: 0.38 },
    },
    warp: { wavelength: 1024, amplitudes: [1, 0.5], strength: 16 }
}

const DEPRECATED_CLIMATE_CONFIG_2: ClimateConfig = {
    axes: {
        temperature:     { wavelength: 1024, amplitudes: [1.5, 0, 1], spread: 0.39, offset: 0.04 },
        humidity:        { wavelength: 256, amplitudes: [1, 1], spread: 0.50 },
        continentalness: { wavelength: 512,  amplitudes: [1, 1, 2, 2, 2, 1, 1, 1, 1], spread: 0.5, offset: 0.05 },
        erosion:         { wavelength: 512, amplitudes: [1, 1, 0, 1, 1], spread: 0.50 },
        weirdness:       { wavelength: 128, amplitudes: [1, 2, 1], spread: 0.50 },
    },
    warp: { wavelength: 32, amplitudes: [1, 1, 1], strength: 3 }
}

/**
 *  nine-octave continentalness for fractal-ed land
 *      mushroom field frequency reduced in climate.ts by lowering threshold
 *  temperature wavelength tuned for appropriately-spaced hot and cold patches
 *      spread lowered for increased separation and more neutral patches
 *      offset for balance
 *  humidity tuned for approximately equal distribution across thresholds
 *  erosion tuned for 6.0%, 19.5%, 9.8%, 17.7%, 26.1%, 5.5%, 15.3% threshold distribution, no spread
 *  weirdness largely untouched, can raise wavelength to slow down weirdness changes
 *  warp minimal due to fractal continentalness
 */

export const DEFAULT_CLIMATE_CONFIG: ClimateConfig = {
    axes: {
        temperature:     { wavelength: 1024, amplitudes: [1.5, 0, 1],                 spread: 0.39, offset: 0.04 },
        humidity:        { wavelength: 256,  amplitudes: [1, 1],                      spread: 0.35, offset: -0.02 },
        continentalness: { wavelength: 512,  amplitudes: [1, 1, 2, 2, 2, 1, 1, 1, 1], spread: 0.50 },
        erosion:         { wavelength: 512,  amplitudes: [1, 1, 0, 1, 1],             spread: 0.50 },
        weirdness:       { wavelength: 128,  amplitudes: [1, 2, 1],                   spread: 0.50 },
    },
    warp: { wavelength: 32, amplitudes: [1, 1, 1], strength: 3 }
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
