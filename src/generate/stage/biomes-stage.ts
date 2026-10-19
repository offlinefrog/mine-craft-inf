import { CHUNK_SIZE } from "../../config";
import { Chunk, ChunkStatus } from "../../world/chunk";
import { newClimateSample } from "../source/climate-source";
import type { Context, Stage } from "../context";

export const biomes: Stage = {
    status: ChunkStatus.Biomes,

    run(ctx: Context, chunk: Chunk) {
        const x0 = chunk.cx * CHUNK_SIZE, z0 = chunk.cz * CHUNK_SIZE;

        const s = newClimateSample();

        for (let sx = -1; sx < CHUNK_SIZE + 1; sx++) for (let sz = -1; sz < CHUNK_SIZE + 1; sz++) {            
            ctx.climate.sample(x0 + sx, z0 + sz, s);
            chunk.biomes[Chunk.base(sx, sz)] = ctx.biomes.lookup(s);
        }
    }
}
