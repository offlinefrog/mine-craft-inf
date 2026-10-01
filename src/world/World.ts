import { CS, HEIGHT } from '../config';
import { B } from '../lib/blocks';
import { Chunk } from './Chunk';

export class World {
    readonly chunks = new Map<string, Chunk>();

    get(cx: number, cz: number) {
        return this.chunks.get(`${cx},${cz}`);
    }

    add(c: Chunk) {
        this.chunks.set(`${c.cx},${c.cz}`, c);
    }

    remove(c: Chunk) {
        this.chunks.delete(`${c.cx},${c.cz}`);
    }

    getBlock(x: number, y: number, z: number): number {
        if (y < 0) return B.STONE;
        if (y >= HEIGHT) return B.AIR;

        const c = this.get(Math.floor(x / CS), Math.floor(z / CS));

        return c ? c.get(x & (CS - 1), y, z & (CS - 1)) : B.AIR;
    }
}
