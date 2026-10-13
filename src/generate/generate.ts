// generation pipeline

import { CHUNK_SIZE, WORLD_HEIGHT } from "../config";
import { BIOME } from "../world/biomes/biomes";
import { BLOCK } from "../world/blocks/blocks";
import { Chunk } from "../world/chunk";

const hash = (x: number, z: number): number => {
  let h = (Math.imul(x, 374761393) + Math.imul(z, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const smooth = (t: number): number => t * t * (3 - 2 * t);

function noise(x: number, z: number): number {
  const x0 = Math.floor(x), z0 = Math.floor(z);
  const fx = smooth(x - x0), fz = smooth(z - z0);
  const a = hash(x0, z0), b = hash(x0 + 1, z0), c = hash(x0, z0 + 1), d = hash(x0 + 1, z0 + 1);
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}

export function surfaceTop(x: number, z: number): number {
  const h = 60 + 36 * noise(x / 128, z / 128) + 14 * noise(x / 40, z / 40) + 4 * noise(x / 10, z / 10);
  return Math.min(Math.floor(h), WORLD_HEIGHT - 2);
}

export const heightAt = (x: number, z: number): number => surfaceTop(Math.floor(x), Math.floor(z)) + 1;

export function generateChunk(chunk: Chunk, cx: number, cz: number): void {
  chunk.reset(cx, cz);
  for (let x = -1; x <= CHUNK_SIZE; x++) {
    for (let z = -1; z <= CHUNK_SIZE; z++) {
      const top = surfaceTop(cx * CHUNK_SIZE + x, cz * CHUNK_SIZE + z);
      const c2 = Chunk.base(x, z);
      const col = c2 * WORLD_HEIGHT;
      chunk.heights[c2] = top;
      chunk.blocks.fill(BLOCK.STONE, col, col + top + 1);
      chunk.blocks.fill(BLOCK.AIR, col + top + 1, col + WORLD_HEIGHT);
      chunk.biomes[c2] = BIOME.PLAINS;
    }
  }
}

/**
import { Chunk } from "../world/chunk";

export const STAGES = [biomesStage, noiseStage] as const;

export function generateChunk(ctx: Context, cx: number, cz: number): Chunk {
    const chunk = new Chunk(cx, cz);
    for (const stage of STAGES) stage.run(ctx, chunk);
    return chunk;
}
*/
