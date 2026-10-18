import { BiomeSource } from "./biome-source";
import type { Rule } from "../world/biomes/rules";
import { ClimateSource, type ClimateConfig } from "./climate-source";
import type { Chunk, ChunkStatus } from "../world/chunk";
import { TerrainSource, type TerrainConfig } from "./terrain-source";

export interface Stage {
    readonly status: ChunkStatus;
    run(ctx: Context, chunk: Chunk): void;
}

export interface Context {
    readonly seed: number;
    readonly climate: ClimateSource;
    readonly biomes: BiomeSource;
    readonly terrain: TerrainSource;
}

export function createContext(
    seed: number,
    climateConfig?: ClimateConfig,
    rules?: readonly Rule[],
    terrainConfig?: TerrainConfig,
): Context {
    return {
        seed,
        climate: new ClimateSource(seed, climateConfig),
        biomes: new BiomeSource(rules),
        terrain: new TerrainSource(seed, terrainConfig),
    };
}
