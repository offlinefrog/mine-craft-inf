export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 256;

export const CHUNK_STATUS = [
    'empty', 'biomes', 'terrain', 'surface', 'carvers', 'features', 'light'
] as const;
export type ChunkStatus = (typeof CHUNK_STATUS)[number];

export class Chunk {
    status: ChunkStatus = 'empty';
    readonly blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * WORLD_HEIGHT);
    readonly biomes = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
}
