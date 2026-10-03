import { type Biome, type BiomeID } from "./biome-data";
import type { ClimateSample, ClimateSampler } from "./climate-sample";

BIOMES = new Uint16Array();

export class BiomeSource {
    readonly climate: ClimateSampler;
    readonly biomes: Uint16Array;

    constructor(sampler: ClimateSampler, biomes: readonly Uint16Array = BIOMES) {
        if (biomes.length === 0) throw new Error('BiomeSource needs at least one biome');
        this.climate = sampler;
        this.biomes = biomes;
    }

    biomeAt(wx: number, wz: number): BiomeID {
        return this.biomeFor(this.climate.sample(wx, wz));
    }

    biomeFor(sample: ClimateSample): BiomeID {
        const ls = this.levelClimate(sample);
        return 1;
    }

    private levelClimate(sample: ClimateSample): ClimateSample {
        return {
            temperature: this.levelTemperature(sample.temperature),
            humidity: this.levelHumidty(sample.humidity),
            continentalness: this.levelContinentalness(sample.continentalness),
            erosion: this.levelErosion(sample.erosion),
            weirdness: this.levelWeirdness(sample.weirdness),
            PV: this.levelPV(sample.PV)
        }
    }

    private levelTemperature(T: number): number {
        if (T < -0.45)  return 0;
        if (T < -0.15)  return 1;
        if (T < 0.2)    return 2;
        if (T < 0.55)   return 3;
        return 4;
    }
    private levelHumidty(H: number): number {
        if (H < -0.35)  return 0;
        if (H < -0.1)   return 1;
        if (H < 0.1)    return 2;
        if (H < 0.3)    return 3;
        return 4;
    }
    private levelContinentalness(C: number): number {
        if (C < -1.05)  return 0;   // mushroom fields
        if (C < -0.455) return 1;   // deep ocean
        if (C < -0.19)  return 2;   // ocean
        if (C < -0.11)  return 3;   // coast
        if (C < 0.03)   return 4;   // near-inland
        if (C < 0.3)    return 5;   // mid-inland
        return 6;                   // far-inland
    }
    private levelErosion(E: number): number {
        if (E < -0.78)      return 0;
        if (E < -0.375)     return 1;
        if (E < -0.2225)    return 2;
        if (E < 0.05)       return 3;
        if (E < 0.45)       return 4;
        if (E < 0.55)       return 5;
        return 6;
    }
    private levelWeirdness(W: number): number {
        if (W < 0)  return 0;
        return 1;
    }
    private levelPV(PV: number): number {
        if (PV < -0.85) return 0;   // valleys
        if (PV < -0.2)  return 1;   // low
        if (PV < 0.2)   return 2;   // mid
        if (PV < 0.7)   return 3;   // high
        return 4;                   // peaks
    }
}
