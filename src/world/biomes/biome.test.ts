import { describe, it, expect } from "vitest";

import { BIOME_PROPS } from "./biomes";
import { BiomeRegistry } from "./biome-registry";
import { RULES } from "./data";

describe("biome-registry", () => {
    it("construction success", () => {
        expect(() => new BiomeRegistry(BIOME_PROPS, RULES)).not.toThrow();
    });
});
