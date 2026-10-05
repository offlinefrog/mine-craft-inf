const BLOCK_NAMES = [
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

export type BlockName = (typeof BLOCK_NAMES)[number];

export const BLOCK = Object.fromEntries(
    BLOCK_NAMES.map((n, i) => [n.toUpperCase(), i])
) as { readonly [K in BlockName as Uppercase<K>]: number };

export type BlockID = (typeof BLOCK)[keyof typeof BLOCK];

// rendering
export type RGB = [number, number, number];

export interface BlockDef {
    occludes: boolean;
    texture?: { top: string; bottom?: string; side?: string };
    fallback: RGB;      // fallback color when texture unavailable
}

export const BLOCKS: Record<BlockID, BlockDef> = {
    [BLOCK.AIR]:        { occludes: false,  fallback: [0, 0, 0] },
    [BLOCK.STONE]:      { occludes: true,   fallback: [0.48, 0.48, 0.5] },
    [BLOCK.WATER]:      { occludes: true,   fallback: [0.18, 0.38, 0.8] },
}
