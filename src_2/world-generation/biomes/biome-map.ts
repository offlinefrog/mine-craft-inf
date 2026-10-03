import { DIMENSION_SIZE, type Biome, type BiomeID } from "../../world/biome";
import { OCEAN_BIOMES } from "../../world/biomes";
import type { ClimateSample } from "../climate";

export class BiomeMap {
    readonly ocean: OceanBiomeMap = new OceanBiomeMap();

    lookup(c: ClimateSample) {
        if (c.temperature < 3) return this.ocean.lookup(c.temperature, c.continentalness);
    }
}

class OceanBiomeMap {
    private readonly map: Uint8Array = new Uint8Array(
        DIMENSION_SIZE.temperature * DIMENSION_SIZE.continentalness
    );

    constructor(biomes: Biome[] = OCEAN_BIOMES) {
        this.build(biomes);
    }

    lookup(T: number, C: number): BiomeID {
        return this.map[T * DIMENSION_SIZE.continentalness + C] as BiomeID; 
    }

    private build(biomes: Biome[]): void {
        for (const biome of biomes) for (const region of biome.regions)
            for (let t = region.temperature[0]; t <= region.temperature[1]; t++)
            for (let c = region.continentalness[0]; c <= region.continentalness[1]; c++)
                this.map[t * DIMENSION_SIZE.continentalness + c] = biome.id;
        
    }
}

class InlandBiomeMap {
    readonly map: Uint8Array = new Uint8Array(
        DIMENSION_SIZE.erosion * DIMENSION_SIZE.erosion
    )
}
