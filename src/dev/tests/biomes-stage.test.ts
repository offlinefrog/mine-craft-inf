import { describe, it, expect } from "vitest";
import { Chunk } from "../../world/chunk";
import { createContext, type Context } from "../../generate/context";
import { BIOME_COUNT } from "../../world/biomes/biomes";
import { Generator } from "../../generate/generate";
import { biomes } from "../../generate/biomes-stage";
import { CHUNK_SIZE } from "../../config";

// prefill with sentinel
function generate(ctx: Context, cx: number, cz: number): Chunk {
  const chunk = new Chunk(cx, cz);
  new Generator(ctx, [biomes]).generate(chunk);
  return chunk;
}

const isBiomeID = (id: number): boolean => id >= 1 && id <= BIOME_COUNT;

describe("biomes stage via pipeline (real context)", () => {
  const ctx = createContext(12345);

  it("writes only valid IDs and leaves nothing unset", () => {
    for (const [cx, cz] of [[0, 0], [-5, 9], [200, -300]] as const)
      for (const id of generate(ctx, cx, cz).biomes) {
        expect(isBiomeID(id)).toBe(true);
      }
  });

  it("is independent of generation order", () => {
    const alone = generate(ctx, 4, 4);
    generate(ctx, 3, 4); generate(ctx, 5, 4);
    expect(generate(ctx, 4, 4).biomes).toEqual(alone.biomes);
  });

  it("agrees with neighbours across the shared border", () => {
    const a = generate(ctx, 0, 0), b = generate(ctx, 1, 0);
    for (let lz = -1; lz < CHUNK_SIZE + 1; lz++) {
      expect(a.biome(CHUNK_SIZE, lz)).toBe(b.biome(0, lz));
      expect(b.biome(-1, lz)).toBe(a.biome(CHUNK_SIZE - 1, lz));
    }
    // same check along z
    const c = generate(ctx, 0, 1);
    for (let lx = -1; lx < CHUNK_SIZE + 1; lx++) {
      expect(a.biome(lx, CHUNK_SIZE)).toBe(c.biome(lx, 0));
      expect(c.biome(lx, -1)).toBe(a.biome(lx, CHUNK_SIZE - 1));
    }
  });

  it("is deterministic per seed and differs across seeds", () => {
    expect(generate(createContext(12345), 2, 2).biomes).toEqual(generate(ctx, 2, 2).biomes);
    const differs = [[0, 0], [10, 10], [-20, 5]].some(([cx, cz]) =>
      !Buffer.from(generate(createContext(999), cx!, cz!).biomes)
        .equals(Buffer.from(generate(ctx, cx!, cz!).biomes)));
    expect(differs).toBe(true);
  });
});
