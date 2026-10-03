export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 256;

export class Chunk {
    readonly blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * WORLD_HEIGHT);
    readonly biomes = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);

    cx: number; // chunk coordinates
    cz: number;

    constructor(cx: number, cz: number) {
        this.cx = cx; this.cz = cz;
    }
}
