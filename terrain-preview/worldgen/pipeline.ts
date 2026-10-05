import { Chunk } from "../world/chunk";
import type { GenContext } from "./context";
import { biomesStage } from "./stages/biomes";
import { noiseStage } from "./stages/noise";

/** Stages in order. Surface, carvers, features, heightmaps and light are added here as they exist. */
export const STAGES = [biomesStage, noiseStage] as const;

/** Generate one chunk through every stage. Order of calls across chunks never matters. */
export function generateChunk(ctx: GenContext, cx: number, cz: number): Chunk {
  const chunk = new Chunk(cx, cz);
  for (const stage of STAGES) stage.run(ctx, chunk);
  return chunk;
}
