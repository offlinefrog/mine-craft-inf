import { CHUNK_SIZE, MAX_HEIGHT } from "../config";

import { BLOCK } from "../blocks/block";
import { colormap, WATER_TINT } from '../blocks/color-map';
import { Shape, Tint, registry } from "../blocks/registry";

import { Chunk, PADDING } from "../world/chunk";

export interface MeshData {
    pos: Uint16Array<ArrayBuffer>;
    col: Uint8Array<ArrayBuffer>;
    uv: Uint16Array<ArrayBuffer>;
    idx: Uint16Array<ArrayBuffer> | Uint32Array<ArrayBuffer>;
}

// one per layer: [opaque, cutout, transluscent]
export type ChunkMeshes = (MeshData | null)[];

const FACES = [
    { d: [0, 1, 0],  c: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]], s: 1.0 },
    { d: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], s: 0.5 },
    { d: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], s: 0.8 },
    { d: [1, 0, 0],  c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], s: 0.8 },
    { d: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], s: 0.65 },
    { d: [0, 0, 1],  c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], s: 0.65 },
];
const CROSS = [
    [0.15, 0.15, 0.85, 0.85],
    [0.85, 0.15, 0.15, 0.85]
];
const QUAD_UV = [
    [0, 0], [1, 0], [1, 1], [0, 1]
];
const AXIS = [1, 1, 0, 0, 2, 2];
const AO = [0.5, 0.68, 0.84, 1];
const ONE = [1, 1, 1, 1];
const WATER_TOP = 0.875;

const E = 0.01;
const cols = registry.cols;

function faceUV(fi: number, k: number[]): number[] {
    const u = fi < 2 ? k[0] :
              fi === 2 ? k[2] :
              fi === 3 ? 1 - k[2] :
              fi === 4 ? 1 - k[0] :
              k[0];
    return [u, fi < 2 ? k[2] : k[1]];
}

class Builder {
    p: number[] = [];
    c: number[] = [];
    t: number[] = [];
    i: number[] = [];

    emit(
        pos: number[][],
        uv: number[][],
        slot: number,
        tc: number[] | null,
        sh: number[],
        flip = false
    ) {
        const col = slot % cols;
        const row = (slot / cols) | 0;
        const base = this.p.length / 3;

        for (let k = 0; k < 4; k++) {
            this.p.push(pos[k][0], pos[k][1], pos[k][2]);
            this.c.push(tc ? sh[k] * tc[0] : sh[k], tc ? sh[k] * tc[1] : sh[k], tc ? sh[k] * tc[2] : sh[k], 1);
            this.t.push((col + E + uv[k][0] * (1 - 2 * E)) / cols, 1 - (row + 1 - E - uv[k][1] * (1 - 2 * E)) / cols);
        }

        if (flip) this.i.push(base + 1, base + 2, base + 3, base + 1, base + 3, base);
        else this.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    data(): MeshData | null {
        if (!this.i.length) return null;
        return {
            pos: Uint16Array.from(this.p, (v) => Math.round(v * 16)),
            col: Uint8Array.from(this.c, (v) => Math.round(v * 255)),
            uv: Uint16Array.from(this.t, (v) => Math.round(v * 65535)),
            idx: this.p.length / 3 < 65536 ? Uint16Array.from(this.i) : Uint32Array.from(this.i),
        };
    }
}

export function meshChunk(ch: Chunk): ChunkMeshes {
    const out = [new Builder(), new Builder(), new Builder()];

    const grass: number[][] = [];       // colormap sampled once per column
    const foliage: number[][] = [];

    for (let i = 0; i < CHUNK_SIZE * CHUNK_SIZE; i++) {
        const t = ch.climate[i * 2] / 255;
        const h = ch.climate[i * 2 + 1] / 255;

        grass.push(colormap.grass(t, h));
        foliage.push(colormap.foliage(t, h));
    }

    const tintOf = (tm: number, c: number) =>
        tm === Tint.WATER ? WATER_TINT :
        tm === Tint.GRASS ? grass[c] :
        tm === Tint.FOLIAGE ? foliage[c] :
        tm ? colormap.fixed[tm] :
        null;
    const blocks = ch.blocks;
    const at = (x: number, y: number, z: number) =>
        y < 0 ? BLOCK.STONE :
        y >= MAX_HEIGHT ? BLOCK.AIR :
        blocks[ch.col(x, z) + y];
 
    const occ = (x: number, y: number, z: number) => registry.occludes[at(x, y, z)];
    
    // voxel AO for one face corner: 0 (enclosed) .. 3 (open). (px,py,pz) = block in front of the face.
    const aoCorner = (px: number, py: number, pz: number, a1: number, s1: number, a2: number, s2: number) => {
        const d1x = a1 === 0 ? s1 : 0;
        const d1y = a1 === 1 ? s1 : 0;
        const d1z = a1 === 2 ? s1 : 0;
        
        const d2x = a2 === 0 ? s2 : 0;
        const d2y = a2 === 1 ? s2 : 0;
        const d2z = a2 === 2 ? s2 : 0;

        const side1 = occ(px + d1x, py + d1y, pz + d1z)
        const side2 = occ(px + d2x, py + d2y, pz + d2z);

        if (side1 && side2) return 0;
        return 3 - side1 - side2 - occ(px + d1x + d2x, py + d1y + d2y, pz + d1z + d2z);
    };
 
    for (let z = 0; z < CHUNK_SIZE; z++) for (let x = 0; x < CHUNK_SIZE; x++) {
        const hi = (x + 1) * PADDING + z + 1;   // index into ch.top
        const h = ch.top[hi];
        const m = Math.min(ch.top[hi - PADDING], ch.top[hi + PADDING], ch.top[hi - 1], ch.top[hi + 1]);
        
        // skip solid-occluded
        const base = ch.col(x, z)
        const ci = z * CHUNK_SIZE + x;
        
        for (let y = Math.max(0, Math.min(m, h - 1) + 1); y <= ch.maxY; y++) {
            const id = blocks[base + y];
            const shape = registry.shape[id];
            if (shape === Shape.NONE) continue;
            
            const b = out[registry.layer[id]];
    
            if (shape === Shape.CROSS) {    // plants: two crossed quads, always emitted
                const tc = tintOf(registry.faceTint[id * 6], ci);
                for (const [x0, z0, x1, z1] of CROSS) {
                    b.emit(
                        [
                            [x + x0, y, z + z0],
                            [x + x1, y, z + z1],
                            [x + x1, y + 1, z + z1],
                            [x + x0, y + 1, z + z0]
                        ],
                        QUAD_UV, registry.faceSlot[id * 6], tc, ONE
                    );
                }
                continue;
            }
    
            const liquid = registry.faceTint[id * 6] === Tint.WATER;
            const top = liquid && at(x, y + 1, z) !== id ? WATER_TOP : 1;   // water sits low
            
            for (let fi = 0; fi < 6; fi++) {
                const f = FACES[fi];
                const n = at(x + f.d[0], y + f.d[1], z + f.d[2]);
                if (n === id || registry.occludes[n]) continue;
                
                const tc = tintOf(registry.faceTint[id * 6 + fi], ci);
                const ax = AXIS[fi], a1 = (ax + 1) % 3, a2 = (ax + 2) % 3;
                const px = x + f.d[0], py = y + f.d[1], pz = z + f.d[2];
                
                const av = f.c.map((k) =>
                    liquid ? 3 :
                    aoCorner(
                        px, py, pz, a1,
                        k[a1] ? 1 : -1,
                        a2,
                        k[a2] ? 1 : -1
                    )
                );
                
                b.emit(
                    f.c.map(
                        (k) => [x + k[0], y + (k[1] ? top : 0), z + k[2]]
                    ),
                    f.c.map(
                        (k) => faceUV(fi, k)
                    ),
                    registry.faceSlot[id * 6 + fi], tc,
                    av.map(
                        (a) => f.s * AO[a]
                    ),
                    av[0] + av[2] < av[1] + av[3]
                );
            }
        }
    }

    return out.map((b) => b.data());
}

