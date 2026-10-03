import { CHUNK_SIZE, MAX_HEIGHT } from '../config';

export const PADDING = CHUNK_SIZE + 2;

export class Chunk {
    chunkX = 0;
    chunkZ = 0;
    maxY = 0;   // highest non-air (!0) block
    
    readonly blocks = new Uint16Array(PADDING * PADDING * MAX_HEIGHT);    // 16 x 16 x MAX_HEIGHT array
    readonly top = new Int16Array(PADDING * PADDING);   // terrain surface per padded column

    readonly climate = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * 2);     // per column: temperature, humidity (0..255) for colormap tints
    
    reset(cx: number, cz: number) {
        this.chunkX = cx;
        this.chunkZ = cz;
        this.maxY = 0;
        this.blocks.fill(0);
        this.top.fill(-1);  // outside strip
    }

    // base index of column at section-relative (x, z), each in [-1, CHUNK_SIZE]
    col(x: number, z: number) {
        return ((x + 1) * PADDING + (z + 1)) * MAX_HEIGHT;
    }

    // section-relative coords
    set(x: number, y: number, z: number, id: number) {
        this.blocks[this.col(x, z) + y] = id;
        if (id && y > this.maxY) this.maxY = y;
    }
}
