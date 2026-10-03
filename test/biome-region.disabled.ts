import { describe, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { BIOME, type BiomeRegion, DIMENSION_SIZE, type BiomeDimension, BIOME_DIMENSIONS } from "../src/world/biomes/biome";
import { BIOMES } from "../biome-regions/biomes";

function mergeRegions(regions: BiomeRegion[]): BiomeRegion[] {
    const result = regions.map(region => ({ ...region }));

    let changed = true;

    while (changed) {
        changed = false;

        outer:
        for (let i = 0; i < result.length; i++) {
            for (let j = i + 1; j < result.length; j++) {
                const merged = tryMerge(result[i], result[j]);

                if (merged) {
                    result[i] = merged;
                    result.splice(j, 1);
                    changed = true;
                    break outer;
                }
            }
        }
    }

    return result;
}

function tryMerge(
    a: BiomeRegion,
    b: BiomeRegion
): BiomeRegion | null {
    let differingDimension: BiomeDimension | null = null;

    for (const d of BIOME_DIMENSIONS) {
        const [aMin, aMax] = a[d];
        const [bMin, bMax] = b[d];

        if (aMin === bMin && aMax === bMax) {
            continue;
        }

        // They differ in more than one dimension.
        if (differingDimension !== null) {
            return null;
        }

        differingDimension = d;
    }

    // Identical regions.
    if (differingDimension === null) {
        return { ...a };
    }

    const d = differingDimension;

    const [aMin, aMax] = a[d];
    const [bMin, bMax] = b[d];

    // Must overlap or be adjacent.
    if (aMax + 1 < bMin || bMax + 1 < aMin) {
        return null;
    }

    return {
        ...a,
        [d]: [
            Math.min(aMin, bMin),
            Math.max(aMax, bMax)
        ]
    };
}

describe("BIOMES", () => {
    it("writes biome definitions to a temp file", () => {
        const biomeNames = Object.fromEntries(
            Object.entries(BIOME).map(([name, id]) => [id, name])
        );

        const formatRegion = (region: BiomeRegion): string => {
            const constraints = Object.entries(region)
                .filter(([dimension, range]) => {
                    const [min, max] = range as [number, number];
                    return min !== 0 || max !== DIMENSION_SIZE[dimension as BiomeDimension] - 1;
                })
                .map(([dimension, range]) => {
                    const [min, max] = range as [number, number];
                    return `${dimension}: [${min}, ${max}]`;
                })
                .join(", ");

            return `biomeRegion({ ${constraints} })`;
        };

        const output = BIOMES
            .map(biome => {
                const id = biome.id;

                const name = biomeNames[id]
                    .split("_")
                    .map(word => word[0] + word.slice(1).toLowerCase())
                    .join("");

                const id_text = biomeNames[id];

                const regions = biome.space // mergeRegions(biome.space)
                    .map(formatRegion)
                    .join(",\n        ");

return `const ${name}: Biome = {
    id: BIOME.${id_text},
    regions: [
        ${regions}
    ]
}`;
            })
            .join("\n\n");

        mkdirSync("tmp", { recursive: true });

        const path = join("test", "tmp", "biomes.ts");
        writeFileSync(path, output, "utf-8");

        console.log(`Wrote biome definitions to ${path}`);
    });
});