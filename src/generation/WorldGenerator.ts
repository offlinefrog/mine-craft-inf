import { Chunk } from '../world/Chunk';
import { TerrainGenerator } from './TerrainGenerator';
//import { StructurePlacer } from './StructurePlacer';

export class WorldGenerator {
    //private placer: StructurePlacer;

    private terrain: TerrainGenerator;

    constructor(t: TerrainGenerator, seed: number) {
        this.terrain = t;
    }

    generate(cx: number, cz: number): Chunk {
        const ch = new Chunk(cx, cz);
        this.terrain.fill(ch);
        //this.placer.apply(ch);
        return ch;
    }
}
