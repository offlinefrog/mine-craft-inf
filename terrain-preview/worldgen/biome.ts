import { regions, type BiomeDef, type BiomeId, type BiomeLookup } from "./biomeTable";
import type { ClimateSample, ClimateSampler } from "./climate";

export type { BiomeId } from "./biomeTable";

/** Answers "which biome is at this world position?". Pure: depends only on the seed and config. */
export interface BiomeSource {
  biomeAt(wx: number, wz: number): BiomeId;
}

/** One biome covering everything, until real biomes are defined. */
export const DEFAULT_BIOMES: readonly BiomeDef[] = [
  { id: 0, name: "default", regions: regions() },
];

/** Samples the climate at a position and looks the biome up in a BiomeTable or BiomeGrid. */
export class ClimateBiomeSource implements BiomeSource {
  readonly climate: ClimateSampler;
  readonly table: BiomeLookup;

  constructor(climate: ClimateSampler, table: BiomeLookup) {
    this.climate = climate;
    this.table = table;
  }

  biomeAt(wx: number, wz: number): BiomeId {
    return this.table.find(this.climate.sample(wx, wz));
  }

  /** Same lookup for a climate sample the caller already has, so it isn't sampled twice. */
  biomeFor(c: ClimateSample): BiomeId {
    return this.table.find(c);
  }
}
