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
    WINDSWEPT_GRAVELLY_HILLS: 18
} as const;

export type BiomeID = typeof BIOME[keyof typeof BIOME];

export const BIOME_DIMENSIONS = [...CLIMATE_DIMENSIONS, 'PV'] as const;
type BiomeDimension = (typeof BIOME_DIMENSIONS)[number];

export const DIMENSION_SIZE: Record<BiomeDimension, number> = {
    temperature: 5, humidity: 5, continentalness: 7, erosion: 7, weirdness: 2, PV: 5,
}

export type BiomeRegion = Record<BiomeDimension, [number, number]>
export function biomeRegion(constraints: Partial<BiomeRegion> = {}): BiomeRegion {
    const br = {} as BiomeRegion;
    for (const d of BIOME_DIMENSIONS) {
        br[d] = constraints[d] ?? [0, DIMENSION_SIZE[d]];
    }
    return br;
}

export interface Biome {
    id: BiomeID;
    regions: readonly BiomeRegion[];
}
