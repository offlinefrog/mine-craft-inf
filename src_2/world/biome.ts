import { CLIMATE_DIMENSIONS } from "./climate";

export type BiomeID = typeof BIOME[keyof typeof BIOME];

export const BIOME_DIMENSIONS = [...CLIMATE_DIMENSIONS, 'peaksValleys'] as const;
export type BiomeDimension = (typeof BIOME_DIMENSIONS)[number];

export const DIMENSION_SIZE: Record<BiomeDimension, number> = {
    temperature: 5, humidity: 5, continentalness: 7, erosion: 7, weirdness: 2, peaksValleys: 5,
}

type Interval = readonly [min: number, max: number];

type BiomeSpace = Record<BiomeDimension, Interval>;
export function biomeSpace(constraints: Partial<BiomeSpace> = {}): BiomeSpace {
    const bsp = {} as BiomeSpace;
    for (const d of BIOME_DIMENSIONS) {
        bsp[d] = constraints[d] ?? [0, DIMENSION_SIZE[d]];
    }
    return bsp;
}

export interface Biome {
    id: BiomeID;
    regions: readonly BiomeSpace[];
}

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
    SNOWY_SLOPES: 16
} as const;
