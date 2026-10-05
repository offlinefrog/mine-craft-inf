import { describe, expect, it } from "vitest";
import { BIOME, DIMENSION_SIZE, BIOME_DIMENSIONS, type BiomeID, type BiomeRegion } from "../world/biomes/biome";
import { BIOMES } from "../world/biomes/biomes";
import { at, intersect } from "../world/biomes/region";
import { BiomeMap } from "../worldgen/climate/biome-map";

const B = BIOME;
const map = new BiomeMap(BIOMES);

// Continentalness and PV levels, as columns/rows in the wiki table
const [CO, NE, MI, FA] = [3, 4, 5, 6];            // coast, near-inland, mid-inland, far-inland
const [V, LO, MD, HI, PK] = [0, 1, 2, 3, 4];      // valleys, low, mid, high, peaks

/** [T, H, C, E, W, PV] -> expected biome, each read off a cell of the wiki's tables. */
type Check = readonly [cell: readonly [t: number, h: number, c: number, e: number, w: number, pv: number], expected: BiomeID];
const checks: Check[] = [
    // ---- big table, E=0
    [[0, 0, CO, 0, 0, V], B.FROZEN_RIVER], [[2, 0, CO, 0, 0, V], B.RIVER], [[4, 0, NE, 0, 0, V], B.RIVER],
    [[1, 0, MI, 0, 0, V], B.PLAINS], [[4, 0, MI, 0, 0, V], B.BADLANDS], [[4, 3, FA, 0, 0, V], B.WOODED_BADLANDS],
    [[2, 2, CO, 0, 0, LO], B.STONY_SHORE], [[2, 2, CO, 0, 0, MD], B.STONY_SHORE],
    [[4, 2, NE, 0, 0, LO], B.BADLANDS], [[1, 0, NE, 0, 0, LO], B.PLAINS],
    [[0, 0, MI, 0, 0, LO], B.SNOWY_SLOPES], [[0, 3, FA, 0, 0, LO], B.GROVE], [[2, 0, MI, 0, 0, LO], B.FLOWER_FOREST], [[4, 4, FA, 0, 0, LO], B.WOODED_BADLANDS],
    [[0, 1, NE, 0, 0, MD], B.SNOWY_SLOPES], [[2, 4, NE, 0, 0, MD], B.GROVE], [[3, 0, NE, 0, 0, MD], B.SAVANNA_PLATEAU], [[4, 0, MI, 0, 0, MD], B.BADLANDS], [[2, 2, FA, 0, 0, MD], B.GROVE],
    [[2, 0, CO, 0, 1, HI], B.SUNFLOWER_PLAINS], [[1, 2, NE, 0, 0, HI], B.GROVE], [[3, 4, NE, 0, 0, HI], B.JUNGLE],
    [[0, 0, MI, 0, 0, HI], B.JAGGED_PEAKS], [[1, 0, MI, 0, 1, HI], B.FROZEN_PEAKS], [[3, 0, FA, 0, 0, HI], B.STONY_PEAKS], [[4, 3, FA, 0, 0, HI], B.WOODED_BADLANDS],
    [[2, 0, CO, 0, 0, PK], B.JAGGED_PEAKS], [[2, 0, CO, 0, 1, PK], B.FROZEN_PEAKS], [[3, 2, FA, 0, 1, PK], B.STONY_PEAKS],
    // ---- E=1
    [[1, 0, FA, 1, 0, MD], B.MEADOW], [[0, 0, FA, 1, 0, MD], B.SNOWY_SLOPES], [[2, 0, MI, 1, 0, MD], B.FLOWER_FOREST], [[0, 3, MI, 1, 0, MD], B.GROVE],
    [[3, 0, CO, 1, 0, HI], B.SAVANNA], [[0, 0, NE, 1, 0, HI], B.SNOWY_SLOPES], [[2, 0, NE, 1, 1, HI], B.SUNFLOWER_PLAINS],
    [[2, 0, MI, 1, 0, HI], B.SNOWY_SLOPES], [[3, 0, MI, 1, 0, HI], B.SAVANNA_PLATEAU],
    [[0, 0, CO, 1, 0, PK], B.SNOWY_SLOPES], [[2, 4, CO, 1, 0, PK], B.DARK_FOREST], [[2, 0, FA, 1, 1, PK], B.FROZEN_PEAKS],
    // ---- E=2
    [[0, 0, FA, 2, 0, V], B.FROZEN_RIVER], [[2, 0, FA, 2, 0, V], B.RIVER],
    [[2, 2, CO, 2, 0, LO], B.STONY_SHORE], [[2, 1, NE, 2, 0, LO], B.PLAINS], [[4, 2, MI, 2, 0, LO], B.BADLANDS], [[3, 2, FA, 2, 0, LO], B.FOREST],
    [[1, 0, MI, 2, 0, MD], B.PLAINS], [[1, 0, FA, 2, 0, MD], B.MEADOW], [[1, 0, FA, 2, 1, MD], B.CHERRY_GROVE],
    [[0, 0, CO, 2, 1, HI], B.ICE_SPIKES], [[1, 4, NE, 2, 0, HI], B.OLD_GROWTH_SPRUCE_TAIGA], [[2, 4, MI, 2, 0, HI], B.PALE_GARDEN], [[4, 3, FA, 2, 0, PK], B.WOODED_BADLANDS],
    // ---- E=3
    [[0, 2, CO, 3, 0, LO], B.SNOWY_BEACH], [[2, 2, CO, 3, 0, LO], B.BEACH], [[4, 2, CO, 3, 0, LO], B.DESERT],
    [[2, 4, NE, 3, 0, LO], B.DARK_FOREST], [[4, 0, MI, 3, 0, LO], B.BADLANDS], [[3, 0, CO, 3, 0, MD], B.SAVANNA],
    [[4, 4, MI, 3, 0, HI], B.WOODED_BADLANDS], [[3, 1, FA, 3, 0, HI], B.SAVANNA_PLATEAU],
    // ---- E=4
    [[1, 2, CO, 4, 0, LO], B.BEACH], [[4, 2, CO, 4, 0, LO], B.DESERT],
    [[2, 2, CO, 4, 0, MD], B.BEACH], [[2, 0, CO, 4, 1, MD], B.SUNFLOWER_PLAINS], [[2, 0, MI, 4, 0, LO], B.FLOWER_FOREST],
    // ---- E=5
    [[2, 2, CO, 5, 0, LO], B.BEACH], [[3, 1, CO, 5, 1, LO], B.WINDSWEPT_SAVANNA], [[1, 1, CO, 5, 1, LO], B.PLAINS], [[3, 4, CO, 5, 1, LO], B.BAMBOO_JUNGLE],
    [[3, 1, NE, 5, 0, LO], B.SAVANNA], [[2, 3, NE, 5, 1, LO], B.WINDSWEPT_SAVANNA], [[0, 0, MI, 5, 0, LO], B.SNOWY_PLAINS],
    [[0, 0, MI, 5, 0, MD], B.WINDSWEPT_GRAVELLY_HILLS], [[2, 2, FA, 5, 0, MD], B.WINDSWEPT_HILLS], [[1, 3, FA, 5, 0, MD], B.WINDSWEPT_FOREST],
    [[3, 0, FA, 5, 0, MD], B.SAVANNA], [[3, 2, FA, 5, 0, MD], B.FOREST], [[3, 2, FA, 5, 1, MD], B.PLAINS], [[3, 4, FA, 5, 1, MD], B.BAMBOO_JUNGLE],
    [[4, 1, FA, 5, 0, MD], B.DESERT], [[2, 4, FA, 5, 0, MD], B.WINDSWEPT_FOREST],
    [[4, 2, CO, 5, 1, HI], B.WINDSWEPT_SAVANNA], [[0, 0, CO, 5, 0, PK], B.WINDSWEPT_GRAVELLY_HILLS], [[3, 0, CO, 5, 1, PK], B.WINDSWEPT_SAVANNA],
    // ---- E=6
    [[1, 0, CO, 6, 0, V], B.RIVER], [[1, 0, NE, 6, 0, V], B.SWAMP], [[3, 0, FA, 6, 0, V], B.MANGROVE_SWAMP], [[0, 0, MI, 6, 0, V], B.FROZEN_RIVER],
    [[0, 2, CO, 6, 0, LO], B.SNOWY_BEACH], [[0, 0, NE, 6, 0, LO], B.SNOWY_PLAINS], [[2, 0, FA, 6, 0, LO], B.SWAMP], [[4, 0, MI, 6, 0, LO], B.MANGROVE_SWAMP],
    [[3, 2, CO, 6, 0, MD], B.BEACH], [[3, 0, CO, 6, 1, MD], B.SAVANNA], [[2, 4, FA, 6, 0, HI], B.DARK_FOREST],
    // ---- "Middle biomes" table (E=4, high, far-inland: middle biomes everywhere)
    [[0, 0, FA, 4, 0, HI], B.SNOWY_PLAINS], [[0, 0, FA, 4, 1, HI], B.ICE_SPIKES], [[1, 0, FA, 4, 1, HI], B.DAPPLED_FOREST],
    [[2, 0, FA, 4, 0, HI], B.FLOWER_FOREST], [[3, 1, FA, 4, 0, HI], B.SAVANNA], [[4, 3, FA, 4, 0, HI], B.DESERT],
    [[0, 1, FA, 4, 0, HI], B.SNOWY_PLAINS], [[1, 1, FA, 4, 0, HI], B.PLAINS], [[2, 1, FA, 4, 1, HI], B.PLAINS],
    [[0, 2, FA, 4, 1, HI], B.SNOWY_TAIGA], [[1, 2, FA, 4, 0, HI], B.FOREST], [[2, 2, FA, 4, 0, HI], B.FOREST],
    [[3, 2, FA, 4, 0, HI], B.FOREST], [[3, 2, FA, 4, 1, HI], B.PLAINS],
    [[0, 3, FA, 4, 0, HI], B.SNOWY_TAIGA], [[1, 3, FA, 4, 0, HI], B.TAIGA],
    [[2, 3, FA, 4, 0, HI], B.BIRCH_FOREST], [[2, 3, FA, 4, 1, HI], B.OLD_GROWTH_BIRCH_FOREST],
    [[3, 3, FA, 4, 0, HI], B.JUNGLE], [[3, 3, FA, 4, 1, HI], B.SPARSE_JUNGLE],
    [[0, 4, FA, 4, 0, HI], B.TAIGA], [[1, 4, FA, 4, 0, HI], B.OLD_GROWTH_SPRUCE_TAIGA], [[1, 4, FA, 4, 1, HI], B.OLD_GROWTH_PINE_TAIGA],
    [[2, 4, FA, 4, 0, HI], B.DARK_FOREST], [[3, 4, FA, 4, 0, HI], B.JUNGLE], [[3, 4, FA, 4, 1, HI], B.BAMBOO_JUNGLE],
    // ---- "Plateau biomes" table (E=2, mid, far-inland)
    [[0, 0, FA, 2, 0, MD], B.SNOWY_PLAINS], [[0, 0, FA, 2, 1, MD], B.ICE_SPIKES], [[0, 1, FA, 2, 0, MD], B.SNOWY_PLAINS], [[0, 2, FA, 2, 0, MD], B.SNOWY_PLAINS],
    [[0, 3, FA, 2, 0, MD], B.SNOWY_TAIGA], [[0, 4, FA, 2, 0, MD], B.SNOWY_TAIGA],
    [[1, 1, FA, 2, 0, MD], B.MEADOW], [[1, 2, FA, 2, 0, MD], B.FOREST], [[1, 2, FA, 2, 1, MD], B.MEADOW],
    [[1, 3, FA, 2, 0, MD], B.TAIGA], [[1, 3, FA, 2, 1, MD], B.MEADOW],
    [[1, 4, FA, 2, 0, MD], B.OLD_GROWTH_SPRUCE_TAIGA], [[1, 4, FA, 2, 1, MD], B.OLD_GROWTH_PINE_TAIGA],
    [[2, 0, FA, 2, 0, MD], B.MEADOW], [[2, 1, FA, 2, 1, MD], B.CHERRY_GROVE], [[2, 2, FA, 2, 0, MD], B.MEADOW], [[2, 2, FA, 2, 1, MD], B.FOREST],
    [[2, 3, FA, 2, 0, MD], B.MEADOW], [[2, 3, FA, 2, 1, MD], B.BIRCH_FOREST], [[2, 4, FA, 2, 0, MD], B.PALE_GARDEN],
    [[3, 0, FA, 2, 0, MD], B.SAVANNA_PLATEAU], [[3, 1, FA, 2, 0, MD], B.SAVANNA_PLATEAU], [[3, 2, FA, 2, 0, MD], B.FOREST],
    [[3, 3, FA, 2, 0, MD], B.FOREST], [[3, 4, FA, 2, 0, MD], B.JUNGLE],
    [[4, 0, FA, 2, 0, MD], B.BADLANDS], [[4, 1, FA, 2, 1, MD], B.ERODED_BADLANDS], [[4, 2, FA, 2, 0, MD], B.BADLANDS],
    [[4, 3, FA, 2, 0, MD], B.WOODED_BADLANDS], [[4, 4, FA, 2, 0, MD], B.WOODED_BADLANDS],
    // ---- "Shattered biomes" table (E=5, mid, far-inland)
    [[1, 1, FA, 5, 1, MD], B.WINDSWEPT_GRAVELLY_HILLS], [[0, 2, FA, 5, 0, MD], B.WINDSWEPT_HILLS], [[0, 4, FA, 5, 0, MD], B.WINDSWEPT_FOREST],
    [[2, 0, FA, 5, 0, MD], B.WINDSWEPT_HILLS], [[2, 1, FA, 5, 0, MD], B.WINDSWEPT_HILLS], [[2, 3, FA, 5, 0, MD], B.WINDSWEPT_FOREST],
    [[3, 1, FA, 5, 0, MD], B.SAVANNA], [[3, 3, FA, 5, 0, MD], B.JUNGLE], [[3, 3, FA, 5, 1, MD], B.SPARSE_JUNGLE],
    // ---- "Badland biomes" table (E=0, peaks, far-inland, T=4)
    [[4, 0, FA, 0, 0, PK], B.BADLANDS], [[4, 1, FA, 0, 1, PK], B.ERODED_BADLANDS], [[4, 2, FA, 0, 1, PK], B.BADLANDS],
    [[4, 3, FA, 0, 0, PK], B.WOODED_BADLANDS], [[4, 4, FA, 0, 1, PK], B.WOODED_BADLANDS],
];

describe("overworld biome table", () => {
    it("claims every one of the 12,250 cells exactly once: no holes, no cell claimed by two biomes", () => {
        expect(map.unpainted).toEqual(0);
        expect(map.conflicts).toEqual(0);
    });

    it("every biome in BIOME occurs somewhere", () => {
        const seen = new Set<number>(map.map);
        const missing = Object.entries(B).filter(([, id]) => !seen.has(id)).map(([name]) => name);
        expect(missing.join(",")).toEqual("");
    });

    it(`matches ${checks.length} cells read off the wiki's tables`, () => {
        const wrong = checks.filter(([[t, h, c, e, w, pv], want]) => map.atLevels(t, h, c, e, w, pv) !== want)
            .map(([cell, want]) => `[T,H,C,E,W,PV]=[${cell}] expected ${want}, got ${map.atLevels(...cell)}`);
        expect(wrong.join("\n")).toEqual("");
    });

    it("looks up a ClimateSample through the level thresholds", () => {
        const sample = { temperature: -0.5, humidity: -0.5, continentalness: 0.5, erosion: -0.9, weirdness: -0.5, PV: 0.9 };
        expect(map.at(sample)).toEqual(B.JAGGED_PEAKS);                        // T0 H0 C6 E0 W0 PV4
        expect(map.at({ ...sample, weirdness: 0.5 })).toEqual(B.FROZEN_PEAKS);
        expect(map.at({ ...sample, continentalness: -0.3 })).toEqual(B.FROZEN_OCEAN);   // ocean level, T0
    });
});

describe("region helpers", () => {
    it("at() builds inclusive boxes and rejects levels out of range", () => {
        const r = at({ T: [1, 2], W: 0 });
        expect(r.temperature[0]).toEqual(1); expect(r.temperature[1]).toEqual(2);
        expect(r.humidity[1]).toEqual(DIMENSION_SIZE.humidity - 1);            // unlisted = full range, inclusive
        expect(() => at({ E: 7 })).toThrow();
        expect(() => at({ T: [3, 1] })).toThrow();
    });
    it("intersect() overlaps or returns undefined", () => {
        const a = at({ T: [0, 2] }), b = at({ T: [2, 4], H: 1 });
        const i = intersect(a, b) as BiomeRegion;
        expect(i.temperature[0]).toEqual(2); expect(i.temperature[1]).toEqual(2); expect(i.humidity[0]).toEqual(1);
        expect(intersect(at({ T: 0 }), at({ T: 1 })) === undefined).toEqual(true);
    });
    it("BiomeMap rejects out-of-range regions", () => {
        const bad = { id: B.OCEAN, get space() { return [{ ...at(), erosion: [0, 7] } as unknown as BiomeRegion]; } };
        expect(() => new BiomeMap([bad])).toThrow();
        expect(BIOME_DIMENSIONS.length).toEqual(6);
    });
});
