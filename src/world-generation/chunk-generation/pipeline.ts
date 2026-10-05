import { Chunk } from "../../world/chunk";
import type { Context } from "./context";
import { biomesStage } from "./biomes";
import { noiseStage } from "./noise";

/** Stages in order. Surface, carvers, features, heightmaps and light are added here as they exist. */
export const STAGES = [biomesStage, noiseStage] as const;

/** Generate one chunk through every stage. Order of calls across chunks never matters. */
export function generateChunk(ctx: Context, cx: number, cz: number): Chunk {
  const chunk = new Chunk(cx, cz);
  for (const stage of STAGES) stage.run(ctx, chunk);
  return chunk;
}
