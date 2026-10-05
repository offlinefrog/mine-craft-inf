import { CHUNK_SIZE, ChunkStatus, columnIndex, type Chunk } from "../../world/chunk";
import type { GenContext } from "../context";

/**
 * Biomes stage: writes a biome id for every column of the chunk. The chunk stores only the
 * result; climate is never stored on it. Later stages that need continuous values (terrain
 * splines) ask ctx.climate for them directly at whatever world positions they need.
 * No neighbor requirements, since everything is sampled in world coordinates.
 */
export const biomesStage = {
  status: ChunkStatus.Biomes,
  neighborRadius: 0,
  run(ctx: GenContext, chunk: Chunk): void {
    const x0 = chunk.cx * CHUNK_SIZE, z0 = chunk.cz * CHUNK_SIZE;
    for (let lz = 0; lz < CHUNK_SIZE; lz++)
      for (let lx = 0; lx < CHUNK_SIZE; lx++)
        chunk.biomes[columnIndex(lx, lz)] = ctx.biomes.at(ctx.srcClimate.sample(x0 + lx, z0 + lz));
    chunk.status = ChunkStatus.Biomes;
  },
};
