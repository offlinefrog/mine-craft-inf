import { CHUNK_SIZE, WORLD_HEIGHT } from "../config";
import { BLOCK, BLOCKS } from "../world/blocks/blocks";
import { Chunk } from "../world/chunk";

const FACES = [
  { dir: [1, 0, 0],  shade: 0.8, corners: [[1,0,0],[1,1,0],[1,1,1],[1,0,1]] }, // +X
  { dir: [-1, 0, 0], shade: 0.8, corners: [[0,0,1],[0,1,1],[0,1,0],[0,0,0]] }, // -X
  { dir: [0, 1, 0],  shade: 1.0, corners: [[0,1,0],[0,1,1],[1,1,1],[1,1,0]] }, // +Y (top)
  { dir: [0, -1, 0], shade: 0.5, corners: [[0,0,1],[0,0,0],[1,0,0],[1,0,1]] }, // -Y (bottom)
  { dir: [0, 0, 1],  shade: 0.9, corners: [[1,0,1],[1,1,1],[0,1,1],[0,0,1]] }, // +Z
  { dir: [0, 0, -1], shade: 0.9, corners: [[0,0,0],[0,1,0],[1,1,0],[1,0,0]] }, // -Z
] as const;

export interface ChunkMesh {
    positions: Float32Array;    // xyz, chunk-relative
    colors: Float32Array;       // rgb, 0..1
    indices: Uint32Array;
} 

export function meshChunk(chunk: Chunk): ChunkMesh {
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    let vertexCount = 0;

    for (let y = 0; y < WORLD_HEIGHT; y++) for (let z = 0; z < CHUNK_SIZE; z++) for (let x = 0; x < CHUNK_SIZE; x++) {
        const id = chunk.blocks[Chunk.index(x, y, z)];
        const def = BLOCKS[id];
        if (id === BLOCK.AIR) continue;

        for (const face of FACES) {
            const [dx, dy, dz] = face.dir;
            const neighbor = BLOCKS[chunk.blockAt(x + dx, y + dy, z + dz)];

            if (neighbor && neighbor.occludes) continue;

            const [r, g, b] = def.fallback;

            for (const [cx, cy, cz] of face.corners) {
                positions.push(x + cx, y + cy, z + cz);
                colors.push(r * face.shade, g * face.shade, b * face.shade);
            }

            indices.push(
                vertexCount, vertexCount + 1, vertexCount + 2,
                vertexCount, vertexCount + 2, vertexCount + 3,
            );
            vertexCount += 4;
        }
    }

    return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
        indices: new Uint32Array(indices)
    };
}
