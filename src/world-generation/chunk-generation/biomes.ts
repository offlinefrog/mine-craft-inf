import { Chunk, CHUNK_SIZE, ChunkStatus, columnIndex } from "../../world/chunk";
import type { Context } from "./context";

/**
 *  Minecraft worldgen biomes stage: fills chunk columns with BiomeID
 */
export const biomesStage = {
    status: ChunkStatus.Biomes,
    neighborRadius: 0,
    
    run(ctx: Context, chunk: Chunk): void {
        const x0 = chunk.cx * CHUNK_SIZE, z0 = chunk.cz * CHUNK_SIZE;
        
        for (let sz = 0; sz < CHUNK_SIZE; sz++) for (let sx = 0; sx < CHUNK_SIZE; sx++) {
            const wx = x0 + sx, wz = z0 + sz;

            chunk.biomes[columnIndex(sx, sz)] = ctx.biomes.at(ctx.climate.sample(wx, wz));
        }

        chunk.status = ChunkStatus.Biomes;
    }
}
