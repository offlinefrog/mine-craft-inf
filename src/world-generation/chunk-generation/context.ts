import type { Biome } from "../../world/biomes/biome";
import { BIOMES } from "../../world/biomes/biomes";
import { BiomeMap } from "../biome-map";
import { ClimateSampler, DEFAULT_CLIMATE_CONFIG, type ClimateConfig } from "../climate-sample";
import { Clearance, DEFAULT_CLEARANCE_CONFIG, type ClearanceConfig } from "../clearance";
import { DEFAULT_TERRAIN_CONFIG, TerrainSampler, type TerrainConfig } from "../terrain-sample";

export class Context {
    readonly climate: ClimateSampler;
    readonly biomes: BiomeMap;
    readonly terrain: TerrainSampler;
    
    readonly clearance: Clearance | null;

    readonly seed: number;

    constructor(
        seed: number,
        climateConfig: ClimateConfig = DEFAULT_CLIMATE_CONFIG,
        biomes: readonly Biome[] = BIOMES,
        terrainConfig: TerrainConfig = DEFAULT_TERRAIN_CONFIG,
        clearanceConfig: ClearanceConfig | null = DEFAULT_CLEARANCE_CONFIG,
    ) {
        this.climate = new ClimateSampler(seed, climateConfig);
        this.biomes = new BiomeMap(biomes);
        this.terrain = new TerrainSampler(seed, terrainConfig);

        this.clearance = clearanceConfig ? new Clearance(clearanceConfig) : null;

        this.seed = seed;
    }
}
