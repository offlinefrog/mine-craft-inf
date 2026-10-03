import { CLIMATE_DIMENSIONS } from "../climate";

export const BIOME = {
    OCEAN: 0,
    DEEP_OCEAN: 1,
    WARM_OCEAN: 2,
    LUKEWARM_OCEAN: 3,
    DEEP_LUKEWARM_OCEAN: 4,
    COLD_OCEAN: 5,
    DEEP_COLD_OCEAN: 6,
    FROZEN_OCEAN: 7,
    DEEP_FROZEN_OCEAN: 8,
    MUSHROOM_FIELDS: 9,

    JAGGED_PEAKS: 10,
    FROZEN_PEAKS: 11,
    STONY_PEAKS: 12,
    MEADOW: 13,
    CHERRY_GROVE: 14,
    GROVE: 15,
    SNOWY_SLOPES: 16,
    WINDSWEPT_HILLS: 17,
    WINDSWEPT_GRAVELLY_HILLS: 18,
    WINDSWEPT_FOREST: 19,

    FOREST: 20,
    FLOWER_FOREST: 21,
    TAIGA: 22,
    OLD_GROWTH_PINE_TAIGA: 23,
    OLD_GROWTH_SPRUCE_TAIGA: 24,
    SNOWY_TAIGA: 25,
    BIRCH_FOREST: 26,
    OLD_GROWTH_BIRCH_FOREST: 27,
    DARK_FOREST: 28,
    PALE_GARDEN: 29,
    JUNGLE: 30,
    SPARSE_JUNGLE: 31,
    BAMBOO_JUNGLE: 32,
    DAPPLED_FOREST: 33,

    RIVER: 34,
    FROZEN_RIVER: 35,
    SWAMP: 36,
    MANGROVE_SWAMP: 37,
    BEACH: 38,
    SNOWY_BEACH: 39,
    STONY_SHORE: 40,

    PLAINS: 41,
    SUNFLOWER_PLAINS: 42,
    SNOWY_PLAINS: 43,
    ICE_SPIKES: 44,

    DESERT: 45,
    SAVANNA: 46,
    SAVANNA_PLATEAU: 47,
    WINDSWEPT_SAVANNA: 48,
    BADLANDS: 49,
    WOODED_BADLANDS: 50,
    ERODED_BADLANDS: 51
} as const;

export type BiomeID = typeof BIOME[keyof typeof BIOME];

export const BIOME_DIMENSIONS = [...CLIMATE_DIMENSIONS, 'PV'] as const;
export type BiomeDimension = (typeof BIOME_DIMENSIONS)[number];

export const DIMENSION_SIZE: Record<BiomeDimension, number> = {
    temperature: 5, humidity: 5, continentalness: 7, erosion: 7, weirdness: 2, PV: 5,
}

export type BiomeRegion = Record<BiomeDimension, [number, number]>
export function biomeRegion(constraints: Partial<BiomeRegion> = {}): BiomeRegion {
    const br = {} as BiomeRegion;
    for (const d of BIOME_DIMENSIONS) {
        br[d] = constraints[d] ?? [0, DIMENSION_SIZE[d] - 1];
    }
    return br;
}

export interface Biome {
    id: BiomeID;
    regions: readonly BiomeRegion[];
}
