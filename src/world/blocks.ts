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
// block rendering behavior - cutout for foliage, transluscent for blended textures
export const Layer = { OPAQUE: 0, CUTOUT: 1, TRANSLUSCENT: 2 } as const;
// biome-dependent tints ordered by colormap from https://minecraft.wiki/w/Color#Biome-dependent
export const Tint = { NONE: 0, GRASS: 1, FOLIAGE: 2, BIRCH: 3, SPRUCE: 4, DRY_FOLIAGE: 5, WATER: 6 } as const;

export type Shape = (typeof Shape)[keyof typeof Shape];
export type Layer = (typeof Layer)[keyof typeof Layer];
export type Tint = (typeof Tint)[keyof typeof Tint];

export interface BlockDef {
    shape: Shape;
    layer: Layer;
    occludes: boolean;
    fallback: RGB;

    tex?: { top: string; bottom?: string; side?: string };

    tint?: Tint;
    liquid?: boolean;
}

const cube = (fallback: RGB, options: Partial<BlockDef> = {}): BlockDef =>
    ({ shape: Shape.CUBE, layer: Layer. OPAQUE, occludes: true, fallback, ...options });

export const BLOCK_DEFS: Record<BlockName, BlockDef> = {
    air:                    { shape: Shape.NONE, layer: Layer.OPAQUE, occludes: false, fallback: [0, 0, 0] },
    bedrock:                cube([0.22, 0.22, 0.22]),
    brown_terracotta:       cube([0.45, 0.27, 0.22]),
    calcite:                cube([0.84, 0.82, 0.77]),
    coarse_dirt:            cube([0.42, 0.33, 0.20]),
    deepslate:              cube([0.31, 0.31, 0.33]),
    dirt:                   cube([0.45, 0.31, 0.19]),
    grass_block:            cube([0.36, 0.62, 0.22], {
        tex: { top: "grass_block_top", side: "grass_block_side", bottom: "dirt" }, tint: Tint.GRASS
    }),
    gravel:                 cube([0.55, 0.52, 0.50]),
    ice:                    cube([0.62, 0.80, 0.95], {
        layer: Layer.TRANSLUSCENT, occludes: false,
    }),
    light_gray_terracotta:  cube([0.56, 0.53, 0.51]),
    mud:                    cube([0.30, 0.24, 0.17]),
    mycelium:               cube([0.48, 0.38, 0.43], {
        tex: { top: "mycelium_top", side: "mycelium_side", bottom: "dirt" }
    }),
    orange_terracotta:      cube([0.65, 0.33, 0.15]),
    packed_ice:             cube([0.56, 0.72, 0.90]),
    podzol:                 cube([0.35, 0.24, 0.12], {
        tex: { top: "podzol_top", side: "podzol_side", bottom: "dirt" }
    }),
    powder_snow:            cube([0.90, 0.94, 1.00]),
    red_sand:               cube([0.75, 0.40, 0.14]),
    red_sandstone:          cube([0.68, 0.35, 0.17], {
        tex: { top: "red_sandstone_top", side: "red_sandstone", bottom: "red_sandstone_bottom" }
    }),
    red_terracotta:         cube([0.57, 0.25, 0.20]),
    sand:                   cube([0.84, 0.78, 0.55]),
    sandstone:              cube([0.80, 0.74, 0.50], {
        tex: { top: "sandstone_top", side: "sandstone", bottom: "sandstone_bottom" }
    }),
    snow_block:             cube([0.95, 0.97, 1.00], {
        tex: { top: "snow" }
    }),
    stone:                  cube([0.48, 0.48, 0.50]),
    terracotta:             cube([0.60, 0.38, 0.28]),
    water:                  cube([0.18, 0.38, 0.80], {
        layer: Layer.TRANSLUSCENT, occludes: false,
        tex: { top: "water_still" }, tint: Tint.WATER, liquid: true,
    }),
    white_terracotta:       cube([0.90, 0.82, 0.75]),
    yellow_terracotta:      cube([0.70, 0.52, 0.15]),
}
