import { CLIMATE_DIMENSIONS } from "../climate";

// Ids 0-16 are unchanged from your draft; new ones are appended so existing ids stay stable.
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

    FROZEN_RIVER: 17,
    RIVER: 18,
    STONY_SHORE: 19,
    SNOWY_BEACH: 20,
    BEACH: 21,
    DESERT: 22,
    BADLANDS: 23,
    ERODED_BADLANDS: 24,
    WOODED_BADLANDS: 25,
    SNOWY_PLAINS: 26,
    ICE_SPIKES: 27,
    PLAINS: 28,
    DAPPLED_FOREST: 29,
    FLOWER_FOREST: 30,
    SUNFLOWER_PLAINS: 31,
    SAVANNA: 32,
    FOREST: 33,
    SNOWY_TAIGA: 34,
    TAIGA: 35,
    BIRCH_FOREST: 36,
    OLD_GROWTH_BIRCH_FOREST: 37,
    JUNGLE: 38,
    SPARSE_JUNGLE: 39,
    OLD_GROWTH_SPRUCE_TAIGA: 40,
    OLD_GROWTH_PINE_TAIGA: 41,
    DARK_FOREST: 42,
    BAMBOO_JUNGLE: 43,
    SAVANNA_PLATEAU: 44,
    PALE_GARDEN: 45,
    WINDSWEPT_SAVANNA: 46,
    WINDSWEPT_GRAVELLY_HILLS: 47,
    WINDSWEPT_HILLS: 48,
    WINDSWEPT_FOREST: 49,
    SWAMP: 50,
    MANGROVE_SWAMP: 51
} as const;

export type BiomeID = typeof BIOME[keyof typeof BIOME];

export const BIOME_DIMENSIONS = [...CLIMATE_DIMENSIONS, 'PV'] as const;
export type BiomeDimension = (typeof BIOME_DIMENSIONS)[number];

/** Number of levels per dimension. (Your draft keyed this by `peaksValleys`, but BIOME_DIMENSIONS says 'PV'.) */
export const DIMENSION_SIZE: Record<BiomeDimension, number> = {
    temperature: 5, humidity: 5, continentalness: 7, erosion: 7, weirdness: 2, PV: 5,
}

/** One box of level indices, INCLUSIVE on both ends: [0, 1] means levels 0 and 1. */
export type BiomeRegion = Record<BiomeDimension, [number, number]>

export interface Biome {
    id: BiomeID;

    /** The biome's area of level space: a union of boxes. */
    get space(): BiomeRegion[];
}
