import { CS, HEIGHT } from '../config';
import { B, BLOCKS } from '../lib/blocks';
import { hash3 } from '../lib/noise';
import { Chunk } from '../world/Chunk';
import { World } from '../world/world';

export interface MeshData { pos: Float32Array; col: Float32Array; idx: Uint32Array }
export interface ChunkMeshes { solid: MeshData | null; water: MeshData | null }

const FACES = [
    { d: [0, 1, 0],  c: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]], s: 1.0 },
    { d: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], s: 0.5 },
    { d: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], s: 0.8 },
    { d: [1, 0, 0],  c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], s: 0.8 },
    { d: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], s: 0.65 },
    { d: [0, 0, 1],  c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], s: 0.65 },
];

class Builder {
    p: number[] = []; c: number[] = []; i: number[] = [];
    
    quad(corners: number[][], rgb: number[], s: number) {
        const b = this.p.length / 3;

        for (const k of corners) {
            this.p.push(k[0], k[1], k[2]);
            this.c.push(rgb[0] * s, rgb[1] * s, rgb[2] * s);
        }

        this.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }

    data(): MeshData | null {
        return this.i.length ? {
            pos: new Float32Array(this.p),
            col: new Float32Array(this.c),
            idx: new Uint32Array(this.i)
        } : null;
    }
}

export function meshChunk(world: World, ch: Chunk): ChunkMeshes {
    const ox = ch.cx * CS, oz = ch.cz * CS;
    const solid = new Builder(), water = new Builder();
    const get = (x: number, y: number, z: number) =>
        x >= 0 && x < CS && z >= 0 && z < CS && y >= 0 && y < HEIGHT
            ? ch.blocks[(y * CS + z) * CS + x] : world.getBlock(ox + x, y, oz + z);
    
    for (let y = 0; y < ch.maxY; y++) for (let z = 0; z < CS; z++) for (let x = 0; x < CS; x++) {
        const id = ch.blocks[(y * CS + z) * CS + x];
        if (!id) continue;

        const type = BLOCKS[id];
        const top = type.liquid && get(x, y + 1, z) === B.AIR ? 0.85 : 1;
        const v = 0.9 + 0.1 * hash3(ox + x, y, oz + z);
        const rgb = [type.color[0] * v, type.color[1] * v, type.color[2] * v];
        for (const f of FACES) {
            const n = get(x + f.d[0], y + f.d[1], z + f.d[2]);
            if (type.liquid ? n !== B.AIR : BLOCKS[n].opaque) continue;
            (type.liquid ? water : solid).quad(
                f.c.map((k) => [ox + x + k[0], y + (k[1] ? top : 0), oz + z + k[2]]), rgb, f.s
            );  
        }
    }

    return { solid: solid.data(), water: water.data() };
}
