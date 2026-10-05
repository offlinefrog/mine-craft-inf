import { CHUNK_SIZE, WORLD_HEIGHT } from "../config";
import { BLOCK, type BlockID } from "./blocks/blocks";

// stages of a chunk
export const ChunkStatus = {
    Empty: 0, Biomes: 1, Noise: 2
} as const;
export type ChunkStatus = typeof ChunkStatus[keyof typeof ChunkStatus];

export class Chunk {
    status: ChunkStatus = ChunkStatus.Empty;

    readonly blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * WORLD_HEIGHT);
    readonly biomes = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);

    cx: number; // chunk coordinates
    cz: number;

    constructor(cx: number, cz: number) {
        this.cx = cx; this.cz = cz;
    }

    get key(): string {
        return `${this.cx},${this.cz}`;
    }

    blockAt(x: number, y: number, z: number): BlockID {
        if (y < 0) return BLOCK.STONE;
        if (y >= WORLD_HEIGHT) return BLOCK.AIR;
        return this.blocks[Chunk.index(x, y, z)];
    }

    static column(sx: number, sz: number): number {
        return sz * CHUNK_SIZE + sx;
    }

    static index(sx: number, y: number, sz: number): number {
        return Chunk.column(sx, sz) * WORLD_HEIGHT + y;
    }
}