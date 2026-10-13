import { BIOME_NAMES, BIOME_PROPS, biomeID, type Biome, type BiomeID, type BiomeName, type BiomeProps } from "../../world/biome";
import { level, type ClimateSample } from "../../world/climate";
import { RULES } from "./data";
import { buildGrid, stride, type Rule } from "./rules";

export class BiomeSource {
    private readonly grid: Uint8Array;

    constructor(grid: Uint8Array) {
        this.grid = grid;
    }

    lookup(s: ClimateSample): BiomeID {
        const i =
            level("temperature", s.temperature) * stride.temperature +
            level("humidity", s.humidity) * stride.humidity +
            level("continentalness", s.continentalness) * stride.continentalness +
            level("erosion", s.erosion) * stride.erosion +
            level("weirdness", s.weirdness) * stride.weirdness +
            level("peaksValleys", s.peaksValleys) * stride.peaksValleys;
        return this.grid[i] as BiomeID;
    }
}

export class BiomeRegistry {
    readonly biomes: readonly Biome[];
    readonly source: BiomeSource;

    constructor(props: Readonly<Record<BiomeName, BiomeProps>>, rules: readonly Rule[]) {
        this.source = new BiomeSource(buildGrid(rules));
        this.biomes = BIOME_NAMES.map((name): Biome => {
            const p = props[name];
            return {
                id: biomeID(name),
                name,
                temperature: p.temperature,
                downfall: p.downfall
            };
        });
    }

    get(id: BiomeID): Biome { return this.biomes[id]!; }
    byName(name: BiomeName): Biome { return this.biomes[biomeID(name)]!; }

    get all(): readonly Biome[] { return this.biomes; }
}

export const registry = new BiomeRegistry(BIOME_PROPS, RULES);
