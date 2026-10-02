export const NAMES = [
    'air',
    'birch_leaves',
    'birch_log',
    'cactus',
    'cobblestone',
    'dandelion',
    'dead_bush',
    'dirt',
    'grass_block',
    'gravel',
    'oak_leaves',
    'oak_log',
    'orange_terracotta',
    'podzol',
    'poppy',
    'red_sand',
    'sand',
    'sandstone',
    'short_grass',
    'snow_block',
    'spruce_leaves',
    'spruce_log',
    'stone',
    'terracotta',
    'water',
    'yellow_terracotta'
] as const;

export type BlockName = (typeof NAMES)[number];

export const BLOCK = Object.fromEntries(
    NAMES.map((n, i) => [n.toUpperCase(), i])
) as { readonly [K in BlockName as Uppercase<K>]: number };

export type BLOCK = number;
