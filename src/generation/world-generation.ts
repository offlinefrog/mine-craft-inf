import { Chunk } from "../world/chunk";

import { StructurePlacer } from "./structure-placement";
import { TerrainGenerator } from "./terrain-generation";

export class WorldGenerator {
    private terrain: TerrainGenerator;
    private placer: StructurePlacer;

    constructor(terrain: TerrainGenerator, seed: number) {
        this.terrain = terrain;
        this.placer = new StructurePlacer(terrain, seed);
    }

    generate(ch: Chunk, cx: number, cz: number) {
        ch.reset(cx, cz);
        this.terrain.fill(ch);
        this.placer.apply(ch);
    }
}
