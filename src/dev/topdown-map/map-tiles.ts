import type { Generator } from "../../generate/generate";
import { Chunk } from "../../world/chunk";

// map-relevant info from a Chunk: padded 18x18 arrays indexed by Chunk.base(x, z) in -1..16
export interface Tile {
    readonly biomes: Uint8Array;
    readonly heights: Int16Array;
}

const MAX_TILES = 16384; // ~1 KB each

const keyOf = (cx: number, cz: number): number => (cx + 32768) * 65536 + (cz + 32768);

// runs generation pipeline over one scratch Chunk and extracts Tiles
export class TileCache {
    private readonly tiles = new Map<number, Tile>();
    private readonly scratch = new Chunk(0, 0);
    private readonly generator: Generator;
    generated = 0; // chunks generated since creation (for status)

    constructor(generator: Generator) {
        this.generator = generator;
    }

    get size(): number {
        return this.tiles.size;
    }

    get(cx: number, cz: number): Tile {
        const key = keyOf(cx, cz);
        const hit = this.tiles.get(key);

        if (hit) {
            this.tiles.delete(key);
            this.tiles.set(key, hit);
            return hit;
        }

        this.scratch.reset(cx, cz);
        this.generator.generate(this.scratch);
        this.generated++;

        const tile: Tile = { biomes: this.scratch.biomes.slice(), heights: this.scratch.heights.slice() };
        this.tiles.set(key, tile);
        if (this.tiles.size > MAX_TILES) this.tiles.delete(this.tiles.keys().next().value!);
        return tile;
    }
}
