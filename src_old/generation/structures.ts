import { BLOCK } from "../blocks/block";

export type SetBlock = (x: number, y: number, z: number, id: number) => void;
export type RNG = () => number;

export interface StructureDef {
    cell: number;       // one candidate per cell for cell x cell columns
    radius: number;     // max horizontal reach (for cells overlapping chunks)
    build(r: RNG, x: number, y: number, z: number, set: SetBlock): void;
}

export interface TreeSpecies {
    log: number;                // trunk block
    leaves: number;             // leaf block
    min: number;                // min height
    max: number;                // max height
    shape: 'round' | 'cone';    // canopy shape
}

export function tree(s: TreeSpecies): StructureDef {
    return {
        cell: 7,
        radius: 3,
        build(r, x, y, z, set) {
            const h = s.min + Math.floor(r() * (s.max - s.min + 1));
            for (let i = 0; i < h; i++) set(x, y + i, z, s.log); // trunk
            if (s.shape === 'round') {   // round canopy
                for (let dy = h - 3; dy <= h; dy++) {
                    const rad = dy >= h - 1 ? 1 : 2;
                    for (let dx = -rad; dx <= rad; dx++) for (let dz = -rad; dz <= rad; dz++) {
                        if (Math.abs(dx) === rad && Math.abs(dz) === rad && r() < 0.5) continue;
                        if (dx || dz || dy >= h) set(x + dx, y + dy, z + dz, s.leaves);
                    }
                }
            } else {
                for (let dy = 2; dy <= h; dy++) {
                    const rad = Math.min(2, Math.ceil((h - dy) / 2));
                    for (let dx = -rad; dx <= rad; dx++) for (let dz = -rad; dz <= rad; dz++) {
                        if (Math.abs(dx) + Math.abs(dz) <= rad && (dx || dz || dy >= h)) {
                            set(x + dx, y + dy, z + dz, s.leaves);
                        }
                    }
                }
            }
        },
    };
}

export const oak = tree({ log: BLOCK.OAK_LOG, leaves: BLOCK.OAK_LEAVES, min: 4, max: 6, shape: 'round' });
export const birch = tree({ log: BLOCK.BIRCH_LOG, leaves: BLOCK.BIRCH_LEAVES, min: 5, max: 7, shape: 'round' });
export const spruce = tree({ log: BLOCK.SPRUCE_LOG, leaves: BLOCK.SPRUCE_LEAVES, min: 6, max: 9, shape: 'cone' });

export const cactus: StructureDef = {
    cell: 9,
    radius: 1,
    build(r, x, y, z, set) {
        const h = 2 + Math.floor(r() * 3);
        for (let i = 0; i < h; i++) {
            set(x, y + i, z, BLOCK.CACTUS);
        }
    },
};
