import { CHUNK_SIZE, WORLD_HEIGHT } from "../config";
import type { BiomeID } from "./biomes/biomes";
import { BLOCK, type BlockID } from "./blocks/blocks";

export const ChunkStatus = {
    Empty: 0,
    Biomes: 1,
} as const;
export type ChunkStatus = typeof ChunkStatus[keyof typeof ChunkStatus];

export const PADDED_SIZE = CHUNK_SIZE + 2;

export class Chunk {
    status: ChunkStatus = ChunkStatus.Empty;

    cx: number;    // chunk coordinates relative to world origin
    cz: number;

    // 18 * 18 * WORLD_HEIGHT array of blocks in padded chunk with increment order: y, z, x
    readonly blocks = new Uint8Array(PADDED_SIZE * PADDED_SIZE * WORLD_HEIGHT);
    // 18 * 18 array of column heights of chunk, padded by 1 (neighbors)
    readonly heights = new Int16Array(PADDED_SIZE * PADDED_SIZE);

    // 18 * 18 array of biomes at each column for generation
    readonly biomes = new Uint8Array(PADDED_SIZE * PADDED_SIZE);

    constructor(cx = 0, cz = 0) {
        this.cx = cx; this.cz = cz;
    }
    
    static base(x: number, z: number): number { return (x + 1) * PADDED_SIZE + (z + 1); }
    static column(x: number, z: number): number { return Chunk.base(x, z) * WORLD_HEIGHT; }
    static index(x: number, y: number, z: number): number { return Chunk.column(x, z) + y; }
    
    height(x: number, z: number): number { return this.heights[Chunk.base(x, z)]; }

    block(x: number, y: number, z: number): BlockID {
        if (y < 0) return BLOCK.STONE;
        if (y >= WORLD_HEIGHT) return BLOCK.AIR;
        return this.blocks[Chunk.index(x, y, z)];
    }

    biome(x: number, z: number): BiomeID {
        return this.biomes[Chunk.base(x, z)];
    }

    reset(cx: number, cz: number) {
        this.cx = cx; this.cz = cz;
        this.status = ChunkStatus.Empty;
        this.biomes.fill(0);
        this.heights.fill(0);
        this.blocks.fill(0);
    }
}
