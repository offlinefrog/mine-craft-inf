import { CS, HEIGHT } from '../config';

export class Chunk {
    readonly blocks = new Uint8Array(CS * HEIGHT * CS);
    maxY = 0;
    meshed = false;

    readonly cx: number;
    readonly cz: number;
    
    constructor(cx: number, cz: number) {
        this.cx = cx;
        this.cz = cz;
    }

    get(x: number, y: number, z: number) {
        return this.blocks[(y * CS + z) * CS + x];
    }

    set(x: number, y: number, z: number, id: number) {
        this.blocks[(y * CS + z) * CS + x] = id;
        if (id && y > this.maxY) this.maxY = y;
    }
}
