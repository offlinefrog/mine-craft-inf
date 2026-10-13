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

export type RGB = [number, number, number];

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

interface CubeOptions {
    top?: string; side?: string; bottom?: string;
    layer?: Layer; occludes?: boolean; liquid?: boolean; tint?: Tint;
}

const cube = (name: string, fallback: number, o: CubeOptions = {}): BlockDef => ({
    shape: Shape.CUBE,
    layer: o.layer ?? Layer.OPAQUE,
    occludes: o.occludes ?? true,
    liquid: o.liquid,
    tex: { top: o.top ?? name, bottom: o.bottom ?? name, side: o.side ?? name },
    tint: o.tint,

    fallback: fallback
})

export const BLOCK_DEFS: Record<BlockName, BlockDef> = {
    air:                    { shape: Shape.NONE, layer: Layer.OPAQUE, occludes: false, fallback: 0x000000 },
    bedrock:                cube("bedrock", 0x383838),
    brown_terracotta:       cube("brown_terracotta", 0x734538),
    calcite:                cube("calcite", 0xd6d1c4),
    coarse_dirt:            cube("coarse_dirt", 0x6b5433),
    deepslate:              cube("deepslate", 0x4f4f54),
    dirt:                   cube("dirt", 0x734f30),
    grass_block:            cube("grass_block", 0x5c9e38, {
        top: "grass_block_top", side: "grass_block_side", bottom: "dirt", tint: Tint.GRASS
    }),
    gravel:                 cube("gravel", 0x8c8580),
    ice:                    cube("ice", 0x9eccf2, {
        layer: Layer.TRANSLUCENT, occludes: false,
    }),
    light_gray_terracotta:  cube("light_gray_terracotta", 0x8f8782),
    mud:                    cube("mud", 0x4d3d2b),
    mycelium:               cube("mycelium", 0x7a616e, {
        top: "mycelium_top", side: "mycelium_side", bottom: "dirt"
    }),
    orange_terracotta:      cube("orange_terracotta", 0xa65426),
    packed_ice:             cube("packed_ice", 0x8fb8e6),
    podzol:                 cube("podzol", 0x593d1f, {
        top: "podzol_top", side: "podzol_side", bottom: "dirt"
    }),
    powder_snow:            cube("powder_snow", 0xe60fff),
    red_sand:               cube("red_sand", 0xbf6624),
    red_sandstone:          cube("red_sandstone", 0xad592b, {
        top: "red_sandstone_top", side: "red_sandstone", bottom: "red_sandstone_bottom"
    }),
    red_terracotta:         cube("red_terracotta", 0x914033),
    sand:                   cube("sand", 0xd6c78c),
    sandstone:              cube("sandstone", 0xccbd80, {
        top: "sandstone_top", side: "sandstone", bottom: "sandstone_bottom"
    }),
    snow_block:             cube("snow", 0xf2f7ff),
    stone:                  cube("stone", 0x7a7a80),
    terracotta:             cube("terracotta", 0x996147),
    water:                  cube("water_still", 0x2e61cc, {
        layer: Layer.TRANSLUCENT, occludes: false, liquid: true, tint: Tint.WATER,
    }),
    white_terracotta:       cube("white_terracotta", 0xe6d1bf),
    yellow_terracotta:      cube("yellow_terractotta", 0xb38526),
}
