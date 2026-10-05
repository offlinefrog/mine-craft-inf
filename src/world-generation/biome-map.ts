import { Biome, BIOME_DIMENSIONS, DIMENSION_SIZE, type BiomeID, type BiomeRegion } from "../world/biomes/biome";
import type { ClimateSample } from "./climate-sample";

// product of biome dimension sizes
const MAP_SIZE = BIOME_DIMENSIONS.reduce(
    (n, d) => n * DIMENSION_SIZE[d],
    1
);

export class BiomeMap {
    readonly map: Uint8Array = new Uint8Array(MAP_SIZE);
    private readonly painted = new Uint8Array(MAP_SIZE);

    conflicts = 0;

    constructor(biomes: readonly Biome[]) {
        for (const biome of biomes) for (const region of biome.def.regions)
            this.fill(region, biome.id);
    }

    get unpainted(): number {
        let n = 0;
        for (const p of this.painted) {
            if (p === 0) n++;
        }
        return n;
    }

    at(c: ClimateSample) {
        return this.map[this.index(
            this.levelTemperature(c.temperature),
            this.levelHumidty(c.humidity),
            this.levelContinentalness(c.continentalness),
            this.levelErosion(c.erosion),
            this.levelWeirdness(c.weirdness),
            this.levelPV(c.PV)
        )];
    }

    private fill(region: BiomeRegion, biome: BiomeID) {
        for (const d of BIOME_DIMENSIONS) {
            const [lo, hi] = region[d];

            if (!(lo >= 0 && lo <= hi && hi < DIMENSION_SIZE[d])) {
                throw new RangeError(
                    `Biome ${biome}: ${d} range [${lo}, ${hi}] ` +
                    `is outside 0..${DIMENSION_SIZE[d] - 1}`
                );
            }
        }

        for (let t = region.temperature[0];     t <= region.temperature[1];     t++)
        for (let h = region.humidity[0];        h <= region.humidity[1];        h++)
        for (let c = region.continentalness[0]; c <= region.continentalness[1]; c++)
        for (let e = region.erosion[0];         e <= region.erosion[1];         e++)
        for (let w = region.weirdness[0];       w <= region.weirdness[1];       w++)
        for (let pv = region.PV[0];             pv <= region.PV[1];             pv++) {
            const i = this.index(t, h, c, e, w, pv);

            if (this.painted[i] && this.map[i] !== biome) this.conflicts++;

            this.map[i] = biome;
            this.painted[i] = 1;
        }
    }

    private index(t: number, h: number, c: number, e: number, w: number, pv: number) {
        const S = DIMENSION_SIZE;
        
        return ((((t * S.humidity + h) * S.continentalness + c) * S.erosion + e) * S.weirdness + w) * S.PV + pv;
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
