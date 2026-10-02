import { NAMES, type BlockName } from './block';

export type RGB = [number, number, number];
export const Layer = { OPAQUE: 0, CUTOUT: 1, TRANSLUCENT: 2 } as const;
export const Tint = { NONE: 0, GRASS: 1, FOLIAGE: 2, WATER: 3, BIRCH: 4, SPRUCE: 5 } as const;
export const Shape = { NONE: 0, CUBE: 1, CROSS: 2 } as const;
export type TintMode = (typeof Tint)[keyof typeof Tint];

export interface BlockDef {
    shape: number;
    layer: number;
    occludes: boolean;  // hides neighboring faces (leaves, water, plants don't)
    liquid?: boolean;
    /** vanilla texture names (assets/minecraft/textures.block/*.png), defaults to block's identifier */
    tex?: { top: string; bottom?: string; side?: string };
    tint?: TintMode;    // cube GRASS tints top; else tints all faces
    fallback: RGB;      // fallback color when texture unavailable
}

const cube = (fallback: RGB, o: Partial<BlockDef> = {}): BlockDef =>
    ({ shape: Shape.CUBE, layer: Layer.OPAQUE, occludes: true, fallback, ...o });
const leaves = (fallback: RGB, o: Partial<BlockDef> = {}) =>
    cube(fallback, { layer: Layer.CUTOUT, occludes: false, tint: Tint.FOLIAGE, ...o });
const plant = (fallback: RGB, o: Partial<BlockDef> = {}) =>
    cube(fallback, { shape: Shape.CROSS, layer: Layer.CUTOUT, occludes: false, ...o });

const DEFS: Record<BlockName, BlockDef> = {
    air:                { shape: Shape.NONE, layer: Layer.OPAQUE, occludes: false, fallback: [0, 0, 0] },
    birch_leaves:       leaves([0.4, 0.55, 0.25], { tint: Tint.BIRCH }),
    birch_log:          cube([0.8, 0.78, 0.7], { tex: { top: 'birch_log_top', side: 'birch_log' } }),
    cactus:             cube([0.2, 0.5, 0.25], { tex: { top: 'cactus_top', bottom: 'cactus_bottom', side: 'cactus_side' } }),
    cobblestone:        cube([0.4, 0.4, 0.42]),
    dandelion:          plant([0.95, 0.85, 0.2]),
    dead_bush:          plant([0.45, 0.33, 0.17]),
    dirt:               cube([0.45, 0.31, 0.19]),
    grass_block:        cube([0.36, 0.62, 0.22], { tint: Tint.GRASS, tex: { top: 'grass_block_top', side: 'grass_block_side', bottom: 'dirt' } }),
    gravel:             cube([0.55, 0.52, 0.5]),
    oak_leaves:         leaves([0.2, 0.5, 0.15]),
    oak_log:            cube([0.38, 0.27, 0.15], { tex: { top: 'oak_log_top', side: 'oak_log' } }),
    orange_terracotta:  cube([0.65, 0.33, 0.15]),
    podzol:             cube([0.35, 0.24, 0.12], { tex: { top: 'podzol_top', side: 'podzol_side', bottom: 'dirt' } }),
    poppy:              plant([0.85, 0.15, 0.15]),
    red_sand:           cube([0.75, 0.4, 0.15]),
    sand:               cube([0.84, 0.78, 0.55]),
    sandstone:          cube([0.8, 0.74, 0.5], { tex: { top: 'sandstone_top', side: 'sandstone', bottom: 'sandstone_bottom' } }),
    short_grass:        plant([0.4, 0.65, 0.25], { tint: Tint.GRASS }),
    snow_block:         cube([0.95, 0.97, 1.0], { tex: { top: 'snow' } }),
    spruce_leaves:      leaves([0.12, 0.33, 0.2], { tint: Tint.SPRUCE }),
    spruce_log:         cube([0.25, 0.17, 0.1], { tex: { top: 'spruce_log_top', side: 'spruce_log' } }),
    stone:              cube([0.48, 0.48, 0.5]),
    terracotta:         cube([0.6, 0.38, 0.28]),
    water:              cube([0.18, 0.38, 0.8], { layer: Layer.TRANSLUCENT, occludes: false, liquid: true, tint: Tint.WATER, tex: { top: 'water_still' } }),
    yellow_terracotta:  cube([0.7, 0.52, 0.15]),
};

export interface AtlasSlot { name: string; color: RGB; neutral: boolean }

export class BlockRegistry {
    readonly slots: AtlasSlot[] = [];
    readonly faceSlot: Uint16Array;
    readonly faceTint: Uint8Array;
    readonly occludes: Uint8Array;
    readonly layer: Uint8Array;
    readonly shape: Uint8Array;
    readonly cols: number;

    constructor(defs: Record<BlockName, BlockDef>) {
        const n = NAMES.length;
        this.faceSlot = new Uint16Array(n * 6);
        this.faceTint = new Uint8Array(n * 6);
        this.occludes = new Uint8Array(n);
        this.layer = new Uint8Array(n);
        this.shape = new Uint8Array(n);
        const byName = new Map<string, number>();

        NAMES.forEach((blockName, id) => {
            const d = defs[blockName];

            this.occludes[id] = d.occludes ? 1 : 0;
            this.layer[id] = d.layer;
            this.shape[id] = d.shape;

            if (d.shape === Shape.NONE) return;

            const { top, bottom = top, side = top } = d.tex ?? { top: blockName };
            [top, bottom, side, side, side, side].forEach((name, f) => {
                const t = d.tint === Tint.GRASS && d.shape === Shape.CUBE ?
                    (f === 0 ? Tint.GRASS : Tint.NONE) : (d.tint ?? Tint.NONE);
                
                let slot = byName.get(name);
                if (slot === undefined) {
                    slot = this.slots.length;
                    byName.set(name, slot);
                    this.slots.push({ name, color: d.fallback, neutral: t !== Tint.NONE });
                }

                this.faceSlot[id * 6 + f] = slot;
                this.faceTint[id * 6 + f] = t;
            });
        });

        this.cols = Math.ceil(Math.sqrt(this.slots.length));
    }
}

export const registry = new BlockRegistry(DEFS);
