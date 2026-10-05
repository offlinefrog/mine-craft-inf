export const NAMES = [
    'air',
    'bedrock',
    'brown_terracotta',
    'calcite',
    'coarse_dirt',
    'deepslate',
    'dirt',
    'grass_block',
    'gravel',
    'ice',
    'light_gray_terracotta',
    'mud',
    'mycelium',
    'orange_terracotta',
    'packed_ice',
    'podzol',
    'powder_snow',
    'red_sand',
    'red_sandstone',
    'red_terracotta',
    'sand',
    'sandstone',
    'snow_block',
    'stone',
    'terracotta',
    'water',
    'white_terracotta',
    'yellow_terracotta',
] as const;

export type BlockName = (typeof NAMES)[number];

export const BLOCK = Object.fromEntries(
    NAMES.map((n, i) => [n.toUpperCase(), i])
) as { readonly [K in BlockName as Uppercase<K>]: number };

export type BLOCK = (typeof BLOCK)[keyof typeof BLOCK];