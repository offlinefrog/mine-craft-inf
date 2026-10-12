import { BLOCK_DEFS, BLOCK_NAMES, Shape, Tint, type BlockDef, type BlockName } from "./blocks";

export type RGB = [number, number, number];

export interface AtlasSlot {
    readonly name: string;
    readonly color: RGB;
    readonly neutral: boolean;
}

export class BlockRegistry {
    readonly slots: readonly AtlasSlot[];

    readonly faceSlot: Uint16Array;
    readonly faceTint: Uint8Array;
    readonly occludes: Uint8Array;
    readonly layer: Uint8Array;
    readonly shape: Uint8Array;
    readonly liquid: Uint8Array;

    readonly cols: number;

    constructor(defs: Record<BlockName, BlockDef> = BLOCK_DEFS) {
        const n = BLOCK_NAMES.length;

        this.faceSlot = new Uint16Array(n * 6);
        this.faceTint = new Uint8Array(n * 6);
        this.occludes = new Uint8Array(n);
        this.layer = new Uint8Array(n);
        this.shape = new Uint8Array(n);
        this.liquid = new Uint8Array(n);

        const byKey = new Map<string, number>();
        const slots: AtlasSlot[] = [];

        BLOCK_NAMES.forEach((name, id) => {
            const block = defs[name];
            if (!block) throw new Error(`Missing block definition for "${name}`);

            this.occludes[id] = block.occludes ? 1 : 0;
            this.layer[id] = block.layer;
            this.shape[id] = block.shape;
            this.liquid[id] = block.liquid ? 1 : 0;

            if (block.shape === Shape.NONE) return;

            const { top, bottom = top, side = top } = block.tex ?? { top: name };

            [top, bottom, side, side, side, side].forEach((name, face) => {
                // if grass tint and cube shape, top is tinted; else everything is tinted
                const tint = block.tint === Tint.GRASS && block.shape === Shape.CUBE ?
                    (face === 0 ? Tint.GRASS : Tint.NONE) : (block.tint ?? Tint.NONE);

                const neutral = tint !== Tint.NONE;
                
                const key = `${name}\0${neutral ? 1 : 0}`;
                let slot = byKey.get(key);

                if (slot === undefined) {
                    if (slots.length > 0xffff) {
                        throw new RangeError("Two many atlas slots for Uint16 faceSlot");
                    }

                    slot = slots.length;
                    byKey.set(key, slot);

                    slots.push({ name, color: [...fallback(name, defs)], neutral });
                }

                const index = id * 6 + face;
                this.faceSlot[index] = slot;
                this.faceTint[index] = tint;
            })
        })

        this.slots = slots;
        this.cols = Math.max(1, Math.ceil(Math.sqrt(slots.length)));
    }
}

const FALLBACK_OWNER: Partial<Record<string, BlockName>> = {
    water_still: "water",
    snow: "snow_block"
}
const TEXTURE_SUFFIXES = ["_top", "_bottom", "_side"] as const;
const names = new Set<string>(BLOCK_NAMES);

function fallback(name: string, defs: Record<BlockName, BlockDef>): RGB {
    let owner = FALLBACK_OWNER[name];

    if (owner !== undefined) return defs[owner].fallback;
    if (names.has(name)) return defs[name as BlockName].fallback;

    for (const suffix of TEXTURE_SUFFIXES) {
        if (!name.endsWith(suffix)) continue;
        const owner = name.slice(0, -suffix.length);
        
        if (names.has(owner)) return defs[owner as BlockName].fallback;
    }

    throw new Error(`Cannot infer fallback color for texture "${name}". Add an entry to FALLBACK_OWNER`);
}

export const registry = new BlockRegistry();
