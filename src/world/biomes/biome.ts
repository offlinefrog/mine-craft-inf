import { CLIMATE_DIMENSIONS } from "../climate";

const BIOME_NAMES = [
    'ocean',
    'deep_ocean',
    'warm_ocean',
    'lukewarm_ocean',
    'deep_lukewarm_ocean',
    'cold_ocean',
    'deep_cold_ocean',
    'frozen_ocean',
    'deep_frozen_ocean',
    'mushroom_fields',

    'jagged_peaks',
    'frozen_peaks',
    'stony_peaks',
    'meadow',
    'cherry_grove',
    'grove',
    'snowy_slopes',
    'windswept_hills',
    'windswept_gravelly_hills',
    'windswept_forest',
    
    'forest',
    'flower_forest',
    'taiga',
    'old_growth_pine_taiga',
    'old_growth_spruce_taiga',
    'snowy_taiga',
    'birch_forest',
    'old_growth_birch_forest',
    'dark_forest',
    'pale_garden',
    'jungle',
    'sparse_jungle',
    'bamboo_jungle',
    'dappled_forest',

    'river',
    'frozen_river',
    'swamp',
    'mangrove_swamp',
    'beach',
    'snowy_beach',
    'stony_shore',
    
    'plains',
    'sunflower_plains',
    'snowy_plains',
    'ice_spikes',

    'desert',
    'savanna',
    'savanna_plateau',
    'windswept_savanna',
    'badlands',
    'wooded_badlands',
    'eroded_badlands'
] as const;

export type BiomeName = (typeof BIOME_NAMES)[number];

export const BIOME = Object.fromEntries(
    BIOME_NAMES.map((n, i) => [n.toUpperCase(), i])
) as { readonly [K in BiomeName as Uppercase<K>]: number };

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

export interface BiomeDef {
    regions: readonly BiomeRegion[];
}

export class Biome {
    id: BiomeID;
    def: BiomeDef;

    constructor(id: BiomeID, def: BiomeDef) {
        this.id = id; this.def = def;
    }
}
