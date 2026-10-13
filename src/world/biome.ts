export const BIOME_NAMES = [
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
export const BIOME_COUNT = BIOME_NAMES.length; // < 256 -> Uint8Array

export const BIOME = Object.fromEntries(
    BIOME_NAMES.map((n, i) => [n.toUpperCase(), i])
) as { readonly [K in BiomeName as Uppercase<K>]: number };
export type BiomeID = typeof BIOME[keyof typeof BIOME];
export const biomeID = (name: BiomeName): BiomeID => BIOME[name.toUpperCase() as Uppercase<BiomeName>];

export interface BiomeProps {
    temperature: number;
    downfall: number;
}

export interface Biome {
    readonly id: BiomeID;
    readonly name: BiomeName;
    readonly temperature: number;
    readonly downfall: number;
}

const aridProps = (): BiomeProps => ({ temperature: 2.0, downfall: 0.0 });
const jungleProps = (downfall: number): BiomeProps => ({ temperature: 0.95, downfall: downfall });
const plainsProps = (): BiomeProps => ({ temperature: 0.8, downfall: 0.4 });
const forestProps = (): BiomeProps => ({ temperature: 0.7, downfall: 0.8 });
const birchProps = (): BiomeProps => ({ temperature: 0.6, downfall: 0.6 });
const waterProps = (): BiomeProps => ({ temperature: 0.5, downfall: 0.5 });
const taigaProps = (temperature: number): BiomeProps => ({ temperature: temperature, downfall: 0.8 });
const windyProps = (): BiomeProps => ({ temperature: 0.2, downfall: 0.3 });
const coldProps = (): BiomeProps => ({ temperature: 0.0, downfall: 0.5 });

export const BIOME_PROPS: Record<BiomeName, BiomeProps> = {
    badlands:           aridProps(),
    wooded_badlands:    aridProps(),
    eroded_badlands:    aridProps(),
    desert:             aridProps(),
    windswept_savanna:  aridProps(),
    savanna:            aridProps(),
    savanna_plateau:    aridProps(),

    stony_peaks:    { temperature: 1.0, downfall: 0.3 },

    jungle:         jungleProps(0.9),
    bamboo_jungle:  jungleProps(0.9),
    sparse_jungle:  jungleProps(0.8),

    mushroom_fields:    { temperature: 0.9, downfall: 1.0 },

    mangrove_swamp:     { temperature: 0.8, downfall: 0.9 },
    swamp:              { temperature: 0.8, downfall: 0.9 },

    plains:             plainsProps(),
    beach:              plainsProps(),
    sunflower_plains:   plainsProps(),

    forest:         forestProps(),
    flower_forest:  forestProps(),
    dark_forest:    forestProps(),
    pale_garden:    forestProps(),

    birch_forest:               birchProps(),
    old_growth_birch_forest:    birchProps(),
    dappled_forest:             birchProps(),

    river:                  waterProps(),
    warm_ocean:             waterProps(),
    lukewarm_ocean:         waterProps(),
    deep_lukewarm_ocean:    waterProps(),
    ocean:                  waterProps(),
    deep_ocean:             waterProps(),
    cold_ocean:             waterProps(),
    deep_cold_ocean:        waterProps(),
    
    cherry_grove:               taigaProps(0.5),
    meadow:                     taigaProps(0.5),
    old_growth_pine_taiga:      taigaProps(0.3),
    old_growth_spruce_taiga:    taigaProps(0.25),
    taiga:                      taigaProps(0.25),

    windswept_gravelly_hills:   windyProps(),
    windswept_forest:           windyProps(),
    windswept_hills:            windyProps(),
    stony_shore:                windyProps(),

    snowy_beach:    { temperature: 0.05, downfall: 0.3 },

    frozen_river:       coldProps(),
    frozen_ocean:       coldProps(),
    deep_frozen_ocean:  coldProps(),
    snowy_plains:       coldProps(),
    ice_spikes:         coldProps(),
    
    grove:          { temperature: -0.2, downfall: 0.8 },
    snowy_slopes:   { temperature: -0.3, downfall: 0.9 },
    snowy_taiga:    { temperature: -0.5, downfall: 0.4 },
    frozen_peaks:   { temperature: -0.7, downfall: 0.9 },
    jagged_peaks:   { temperature: -0.7, downfall: 0.9 },
};
