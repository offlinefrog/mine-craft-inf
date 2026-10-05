import { WORLD_HEIGHT } from "../config";

export const CHUNK_SIZE = 16;

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
}

export const columnIndex = (sx: number, sz: number): number =>
    sz * CHUNK_SIZE + sx;

export const blockIndex = (sx: number, y: number, sz: number): number =>
    columnIndex(sx, sz) * WORLD_HEIGHT + y;
