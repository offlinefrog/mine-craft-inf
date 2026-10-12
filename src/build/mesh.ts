// meshChunk returns MeshData necessary to create Three.js Mesh objects from the given Chunk

import { CHUNK_SIZE } from "../config";
import { BLOCK } from "../world/blocks";
import { Chunk } from "../world/chunk";
import { registry } from "../world/registry";

interface Face {
    dx: -1 | 0 | 1;
    dy: -1 | 0 | 1;
    dz: -1 | 0 | 1;
    c: readonly [
        readonly [0 | 1, 0 | 1, 0 | 1],
        readonly [0 | 1, 0 | 1, 0 | 1],
        readonly [0 | 1, 0 | 1, 0 | 1],
        readonly [0 | 1, 0 | 1, 0 | 1],
    ];
}

const FACES: readonly Face[] = [
    { dx: 0,  dy: 1,  dz: 0,  c: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]], },    // +Y
    { dx: 0,  dy: -1, dz: 0,  c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], },    // -Y
    { dx: -1, dy: 0,  dz: 0,  c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], },    // -X
    { dx: 1,  dy: 0,  dz: 0,  c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], },    // +X
    { dx: 0,  dy: 0,  dz: -1, c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], },    // -Z
    { dx: 0,  dy: 0,  dz: 1,  c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], },    // +Z
];

export interface Mesh {
    positions: Uint16Array;
    indices: Uint16Array | Uint32Array;

    blocks: Uint8Array;
}

export function meshChunk(chunk: Chunk): Mesh {
    const positions: number[] = [];
    const indices: number[] = [];

    const blocks: number[] = [];

    let v = 0;

    const occludes = (x: number, y: number, z: number) => registry.occludes[chunk.block(x, y, z)];

    for (let x = 0; x < CHUNK_SIZE; x++) for (let z = 0; z < CHUNK_SIZE; z++) {
        const h = chunk.height(x, z);           // height of column

        const west = chunk.height(x - 1, z);    // height of neighbors
        const east = chunk.height(x + 1, z);
        const north = chunk.height(x, z - 1);
        const south = chunk.height(x, z + 1);

        const m = Math.min(west, east, north, south);   // minimum height of neighbors
        const s = Math.max(0, Math.min(m, h - 1) + 1);  // starting height (if m >= h)

        for (let y = s; y <= h; y++) {
            const block = chunk.block(x, y, z);
            if (block === BLOCK.AIR) continue;

            for (const face of FACES) {
                if (occludes(x + face.dx, y + face.dy, z + face.dz)) continue;

                for (const [cx, cy, cz] of face.c) {
                    positions.push(x + cx, y + cy, z + cz);

                    blocks.push(block);
                }

                indices.push(v, v + 1, v + 2, v, v + 2, v + 3);
                v += 4;
            }
        }
    }

    return {
        positions: new Uint16Array(positions),
        indices: v < 65536 ? new Uint16Array(indices) : new Uint32Array(indices),

        blocks: new Uint8Array(blocks),
    };
}
