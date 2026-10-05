import { BiomeMap } from "../../src/world-generation/biomes/biome-map";
import { DEFAULT_BIOMES } from "../../src/world/biomes/biomes";
import { Clearance, DEFAULT_CLEARANCE_CONFIG, type ClearanceConfig } from "./clearance";
import { ClimateSampler, DEFAULT_CLIMATE_CONFIG, smoothClimateConfig, type ClimateConfig } from "./climate";
import { DEFAULT_TERRAIN_CONFIG, TerrainSampler, type TerrainConfig } from "./terrain";
import { ClimateSampler as srcClimateSampler } from "../../src/world-generation/climate-sample";

/** Everything a stage needs besides the chunk: the seed and the world-coordinate samplers. */
export class GenContext {
  readonly climate: ClimateSampler;
  /** The same climate with fine detail removed (octaves under 192 blocks): what terrain heights are built from. */
  readonly terrainClimate: ClimateSampler;
  readonly biomes: BiomeMap;
  readonly terrain: TerrainSampler;
  /** Limits terrain near the camera's route, or null when switched off. */
  readonly clearance: Clearance | null;

  readonly srcClimate: srcClimateSampler;

  readonly seed: number;

  constructor(
    seed: number,
    climateConfig: ClimateConfig = DEFAULT_CLIMATE_CONFIG,
    terrainConfig: TerrainConfig = DEFAULT_TERRAIN_CONFIG,
    clearanceConfig: ClearanceConfig | null = DEFAULT_CLEARANCE_CONFIG,
  ) {
    this.climate = new ClimateSampler(seed, climateConfig);
    this.terrainClimate = new ClimateSampler(seed, smoothClimateConfig(climateConfig, 192));
    this.biomes = new BiomeMap(DEFAULT_BIOMES);
    this.terrain = new TerrainSampler(seed, terrainConfig);
    this.clearance = clearanceConfig ? new Clearance(clearanceConfig) : null;

    this.srcClimate = new srcClimateSampler(seed);
  
    this.seed = seed;
  }
}
