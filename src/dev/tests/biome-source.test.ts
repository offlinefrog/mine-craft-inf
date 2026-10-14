import { describe, it, expect } from "vitest";

import { BiomeSource } from "../../generate/biome-source";
import { BIOME_RULES } from "../../world/biomes/data";
import { BIOME_COUNT } from "../../world/biomes/biomes";

const isBiomeID = (id: number): boolean => id >= 1 && id <= BIOME_COUNT;

describe("biome-source", () => {
    it("construction success", () => {
        expect(() => new BiomeSource(BIOME_RULES)).not.toThrow();
    });

    it("has no unset biomes", () => {
        const source = new BiomeSource(BIOME_RULES);

        expect([...source.grid].every(id => isBiomeID(id))).toBe(true);
    })
});


