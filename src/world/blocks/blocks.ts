export const BLOCK_NAMES = [
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
) as { readonly [N in BlockName as Uppercase<N>]: number };

export type BlockID = (typeof BLOCK)[keyof typeof BLOCK];

// block geometry - cross for simple vegetation
export const Shape = { NONE: 0, CUBE: 1, CROSS: 2 } as const;
// block rendering behavior - cutout for foliage, translucent for blended textures
export const Layer = { OPAQUE: 0, CUTOUT: 1, TRANSLUCENT: 2 } as const;
// biome-dependent tints ordered by colormap from https://minecraft.wiki/w/Color#Biome-dependent
export const Tint = { NONE: 0, GRASS: 1, FOLIAGE: 2, BIRCH: 3, SPRUCE: 4, DRY_FOLIAGE: 5, WATER: 6 } as const;

export type Shape = (typeof Shape)[keyof typeof Shape];
export type Layer = (typeof Layer)[keyof typeof Layer];
export type Tint = (typeof Tint)[keyof typeof Tint];

export interface BlockDef {
    shape: Shape;
    layer: Layer;
    occludes: boolean;
    liquid?: boolean;

    tex?: { top: string; bottom: string; side: string };
    tint?: Tint;

    fallback: number;
}
