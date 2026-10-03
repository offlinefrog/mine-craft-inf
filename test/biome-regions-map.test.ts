import { describe, expect, it } from "vitest";

import { BiomeMap } from "../biome-regions/biome-map";
import { BIOMES } from "../biome-regions/biomes";
import type { BiomeID } from "../biome-regions/biome";

const MAP_SIZE = 5 * 5 * 7 * 7 * 2 * 5;

describe("BiomeMap", () => {

    it("has the expected size", () => {
        const map = new BiomeMap(BIOMES);

        expect(map.map.length).toBe(MAP_SIZE);
    });

    it("has no gaps", () => {
        const map = new BiomeMap(BIOMES);

        expect(map.unpainted).toBe(0);
    });

    it("has no conflicts between biome regions", () => {
        const map = new BiomeMap(BIOMES);

        expect(map.conflicts).toBe(0);
    });

    it("contains every biome", () => {
        const map = new BiomeMap(BIOMES);

        const present = new Set<BiomeID>();

        for (const id of map.map)
            present.add(id as BiomeID);

        const missing = BIOMES
            .map(biome => biome.id)
            .filter(id => !present.has(id));

        expect(missing).toEqual([]);
    });

    it("contains exactly the expected biome IDs", () => {
        const map = new BiomeMap(BIOMES);

        const actual = new Set(map.map);
        const expected = new Set(BIOMES.map(biome => biome.id));

        expect(actual).toEqual(expected);
    });
});