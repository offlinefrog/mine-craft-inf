import { CHUNK_SIZE, MAX_HEIGHT, SEA_LEVEL, TOP } from "../config";
import { hashInts, mulberry32 } from '../noise';

import { Chunk } from "../world/chunk";

import { BIOMES } from "./biomes";
import type { SetBlock, StructureDef } from "./structures";
import { TerrainGenerator } from "./terrain-generation";

// structures referenced by biome
const DEFS: StructureDef[] = [...new Set(BIOMES.flatMap((b) =>
    b.features.map(([d]) => d)
))];

export class StructurePlacer {
    private terrain: TerrainGenerator;
    private seed: number;

    constructor(terrain: TerrainGenerator, seed: number) {
        this.terrain = terrain;
        this.seed = seed;
    }

    apply(ch: Chunk) {
        const ox = ch.chunkX * CHUNK_SIZE;
        const oz = ch.chunkZ * CHUNK_SIZE;
        
        const set: SetBlock = (x, y, z, id) => {
            const lx = x - ox
            const lz = z - oz;

            if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE || y < 0 || y >= MAX_HEIGHT) return;
            ch.set(lx, y, lz, id);
        };

        DEFS.forEach((d, di) => {
            const cx0 = Math.floor((ox - d.radius) / d.cell)
            const cx1 = Math.floor((ox + CHUNK_SIZE - 1 + d.radius) / d.cell);
            const cz0 = Math.floor((oz - d.radius) / d.cell)
            const cz1 = Math.floor((oz + CHUNK_SIZE - 1 + d.radius) / d.cell);

            for (let cx = cx0; cx <= cx1; cx++) for (let cz = cz0; cz <= cz1; cz++) {
                const rng = mulberry32(hashInts(this.seed, cx, cz, di));
                const px = cx * d.cell + Math.floor(rng() * d.cell);
                const pz = cz * d.cell + Math.floor(rng() * d.cell);
                
                const col = this.terrain.column(px, pz);
                if (col.height <= SEA_LEVEL + 1 || col.height > TOP) continue;
                
                const chance = col.biome.features.find(([s]) => s === d)?.[1] ?? 0;
                if (rng() >= chance * this.terrain.grove(px, pz)) continue;

                d.build(rng, px, col.height + 1, pz, set);
            }
        });
    }
}
