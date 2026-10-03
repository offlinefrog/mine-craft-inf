import { describe, expect, it } from "vitest";

import { BiomeMap } from "../src/world-generation/biomes/biome-map";
import { BIOMES } from "../src/world/biomes/biomes";
import { BIOME, type BiomeID } from "../src/world/biomes/biome";

const MAP_SIZE = 5 * 5 * 7 * 7 * 2 * 5;

const index = (
    t: number,
    h: number,
    c: number,
    e: number,
    w: number,
    pv: number
) => ((((t * 5 + h) * 7 + c) * 7 + e) * 2 + w) * 5 + pv;

describe("BiomeMap", () => {

    it("has the expected size", () => {
        const map = new BiomeMap();

        expect(map.map.length).toBe(MAP_SIZE);
    });

    it("has no gaps", () => {
        const map = new BiomeMap();

        // 0 is a valid biome (OCEAN), so check against the
        // biome definitions rather than checking for a zero value.
        const biomeIDs = new Set(BIOMES.map(biome => biome.id));

        const gaps: number[] = [];

        for (let i = 0; i < map.map.length; i++) {
            if (!biomeIDs.has(map.map[i] as BiomeID))
                gaps.push(i);
        }

        expect(gaps).toEqual([]);
    });

    it("has no conflicts between biome regions", () => {
        const ownership = new Int16Array(MAP_SIZE);
        ownership.fill(-1);

        const conflicts: {
            index: number;
            temperature: number;
            humidity: number;
            continentalness: number;
            erosion: number;
            weirdness: number;
            PV: number;
            existing: BiomeID;
            conflicting: BiomeID;
        }[] = [];

        for (const biome of BIOMES) {
            for (const region of biome.regions) {
                for (let t = region.temperature[0]; t <= region.temperature[1]; t++)
                for (let h = region.humidity[0]; h <= region.humidity[1]; h++)
                for (let c = region.continentalness[0]; c <= region.continentalness[1]; c++)
                for (let e = region.erosion[0]; e <= region.erosion[1]; e++)
                for (let w = region.weirdness[0]; w <= region.weirdness[1]; w++)
                for (let pv = region.PV[0]; pv <= region.PV[1]; pv++) {

                    const i = index(t, h, c, e, w, pv);
                    const existing = ownership[i];

                    if (existing !== -1 && existing !== biome.id) {
                        conflicts.push({
                            index: i,
                            temperature: t,
                            humidity: h,
                            continentalness: c,
                            erosion: e,
                            weirdness: w,
                            PV: pv,
                            existing: existing as BiomeID,
                            conflicting: biome.id,
                        });
                    } else {
                        ownership[i] = biome.id;
                    }
                }
            }
        }

        if (conflicts.length > 0) {
            console.error(`\nFound ${conflicts.length} conflicts:\n`);

            const biomeName = (id: BiomeID) =>
                Object.entries(BIOME)
                    .find(([, value]) => value === id)?.[0] ?? `UNKNOWN(${id})`;

            const groups = new Map<string, number>();

            for (const conflict of conflicts) {
                const a = biomeName(conflict.existing);
                const b = biomeName(conflict.conflicting);
                const key = `${a} <-> ${b}`;

                groups.set(key, (groups.get(key) ?? 0) + 1);
            }

            console.error(`Found ${conflicts.length} overlapping cells:\n`);

            for (const [pair, count] of groups)
                console.error(`${count} cells: ${pair}`);
        }

        

        expect(conflicts).toHaveLength(0);
    });

    it("contains every biome", () => {
        const map = new BiomeMap();

        const present = new Set<BiomeID>();

        for (const id of map.map)
            present.add(id as BiomeID);

        const missing = BIOMES
            .map(biome => biome.id)
            .filter(id => !present.has(id));

        expect(missing).toEqual([]);
    });

    it("contains exactly the expected biome IDs", () => {
        const map = new BiomeMap();

        const actual = new Set(map.map);

        const expected = new Set(BIOMES.map(biome => biome.id));

        expect(actual).toEqual(expected);
    });
});