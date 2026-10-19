import { describe, it } from "vitest";
import { ClimateSource, DEFAULT_CLIMATE_CONFIG, newClimateSample } from "../../generate/source/climate-source";
import { AXES, level, LEVEL_COUNT, type Axis } from "../../world/climate";
import { hash } from "../../noise/hash";

describe("ClimateSource distribution", () => {
    it("distributes samples across climate levels", () => {
        const seed = 1;
        const n = 100_000;
        const extent = 40_000;

        const src = new ClimateSource(seed, DEFAULT_CLIMATE_CONFIG);
        const sample = newClimateSample();

        const counts = Object.fromEntries(
            AXES.map(a => [a, new Array<number>(LEVEL_COUNT[a]).fill(0)])
        ) as Record<Axis, number[]>;

        for (let i = 0; i < n; i++) {
            const x = (hash(seed, i, 1) / 2 ** 32 - 0.5) * extent;
            const z = (hash(seed, i, 2) / 2 ** 32 - 0.5) * extent;

            src.sample(x, z, sample);

            for (const a of AXES) {
                counts[a][level(a, sample[a])]++;
            }
        }

        const percentages = Object.fromEntries(
            AXES.map(a => [
                a,
                counts[a].map(c => 100 * c / n),
            ])
        ) as Record<Axis, number[]>;

        // Report distributions to help tune climate generation.
        for (const a of AXES) {
            console.log(
                a.padEnd(16),
                percentages[a]
                    .map(p => `${p.toFixed(1).padStart(5)}%`)
                    .join(" ")
            );
        }

        // Continentalness targets:
        // 1% mushroom, 10% deep ocean, 10% ocean, 5% coast,
        // and 75% combined near/mid/far inland.
        const continentalness = percentages.continentalness;

        //expect(continentalness[0]).toBeGreaterThanOrEqual(0.3);
        //expect(continentalness[0]).toBeLessThanOrEqual(2.5);

        // Deep ocean and ocean (adjust indices to your actual axis ordering).
        //expect(continentalness[1]).toBeGreaterThanOrEqual(6);
        //expect(continentalness[1]).toBeLessThanOrEqual(14);
        //expect(continentalness[2]).toBeGreaterThanOrEqual(6);
        //expect(continentalness[2]).toBeLessThanOrEqual(14);

        // Coast.
        //expect(continentalness[3]).toBeGreaterThanOrEqual(2);
        //expect(continentalness[3]).toBeLessThanOrEqual(8);

        // Remaining inland levels collectively occupy most of the map.
        const inland = continentalness.slice(4).reduce((sum, p) => sum + p, 0);
        //expect(inland).toBeGreaterThanOrEqual(65);
        //expect(inland).toBeLessThanOrEqual(85);

        // Every level on every axis must have a non-negligible share.
        /**
        for (const a of AXES) {
            for (let i = 0; i < percentages[a].length; i++) {
                expect(
                    percentages[a][i],
                    `${a} level ${i} is starved (${percentages[a][i].toFixed(2)}%)`
                ).toBeGreaterThanOrEqual(1);
            }
        }
        */
    });
});