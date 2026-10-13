import { BLOCK_DEFS, BLOCK_NAMES, Shape, Tint, type BlockDef, type BlockName } from "../world/blocks";

export const UV_INSET = 0.01;
export const TINTED_FALLBACK = 0x909090;

export class BlockRegistry {
    readonly count: number;

    readonly shape: Uint8Array;
    readonly layer: Uint8Array;
    readonly occludes: Uint8Array;
    readonly liquid: Uint8Array;

    readonly faceSlot: Uint16Array;
    readonly faceTint: Uint8Array;

    readonly slotNames: readonly string[];
    readonly slotFallback: readonly number[];

    readonly columns: number;

    constructor(names: readonly string[], defs: Record<BlockName, BlockDef>) {
        if (names[0] !== "air") throw new Error('BlockID 0 must be "air"');
        const n = names.length;

        this.count = n;
        this.shape = new Uint8Array(n);
        this.layer = new Uint8Array(n);
        this.occludes = new Uint8Array(n);
        this.liquid = new Uint8Array(n);

        this.faceSlot = new Uint16Array(n * 6);
        this.faceTint = new Uint8Array(n * 6);

        const slotOf = new Map<string, number>();
        const slotNames: string[] = [];
        const slotFallback: number[] = [];

        const slot = (texture: string, fallback: number): number => {
            let s = slotOf.get(texture);
            if (s === undefined) {
                if (slotNames.length > 0xffff) throw new RangeError("Two many texture slots for Uint16Array");

                s = slotNames.length;
                slotOf.set(texture, s);
                slotNames.push(texture);
                slotFallback.push(fallback);
            }
            return s;
        }

        names.forEach((name, id) => {
            const block = defs[name as BlockName];
            if (!block) throw new Error(`Missing block definition for "${name}"`);

            this.shape[id] = block.shape;
            this.layer[id] = block.layer;
            this.occludes[id] = block.occludes ? 1 : 0;
            this.liquid[id] = block.liquid ? 1 : 0;

            if (block.shape === Shape.NONE) return;
            if (!block.tex) throw new Error(`"${name}" has a shape but no textures`);

            const { top, bottom, side } = block.tex;

            [top, bottom, side, side, side, side].forEach((texture, face) => {
                const tint = block.tint === Tint.GRASS && block.shape === Shape.CUBE ?
                    (face === 0 ? Tint.GRASS : Tint.NONE) : (block.tint ?? Tint.NONE);

                const index = id * 6 + face;
                this.faceTint[index] = tint;
                this.faceSlot[index] = slot(texture, tint !== Tint.NONE ? TINTED_FALLBACK : fallback(name, defs));
            })
        })

        this.slotNames = slotNames;
        this.slotFallback = slotFallback;
        this.columns = Math.max(1, Math.ceil(Math.sqrt(slotNames.length)));
    }

    slotRect(slot: number): [number, number, number, number] {
        const cols = this.columns;
        const col = slot % cols;
        const row = Math.floor(slot / cols);

        return [
            (col + UV_INSET) / cols,
            1 - (row + 1 - UV_INSET) / cols,
            (col + 1 - UV_INSET) / cols,
            1 - (row + UV_INSET) / cols
        ]
    }
}

const FALLBACK_OWNDER: Partial<Record<string, BlockName>> = {
    water_still: "water",
    snow: "snow_block",
}
const TEXTURE_SUFFIXES = ["_top", "_bottom", "_side"] as const;
const names = new Set<string>(BLOCK_NAMES);

function fallback(texture: string, defs: Record<BlockName, BlockDef>): number {
    let owner = FALLBACK_OWNDER[texture];
    if (owner !== undefined) return defs[owner as BlockName].fallback;
    if (names.has(texture)) return defs[texture as BlockName].fallback;

    for (const suffix of TEXTURE_SUFFIXES) {
        if (!texture.endsWith(suffix)) continue;
        const owner = texture.slice(0, -suffix.length);

        if (names.has(owner)) return defs[owner as BlockName].fallback;
    }

    throw new Error(`Cannot infer fallback color for texture "${name}". Add an entry to FALLBACK_OWNER`);
}

export const registry = new BlockRegistry(BLOCK_NAMES, BLOCK_DEFS);
