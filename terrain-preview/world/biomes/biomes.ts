import { BIOME, type Biome, type BiomeID, type BiomeRegion } from "./biome";
import { buildSpaces } from "./overworld-table";

let spaces: Map<BiomeID, BiomeRegion[]> | undefined;   // built on first use

function biome(id: BiomeID): Biome {
    return {
        id,
        get space(): BiomeRegion[] {
            return (spaces ??= buildSpaces()).get(id) ?? [];
        },
    };
}

/** One Biome per id in BIOME; each one's `space` comes from the table in overworld-table.ts. */
export const BIOMES: Biome[] = (Object.values(BIOME) as BiomeID[]).map(biome);
