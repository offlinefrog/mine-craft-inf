import { AXES, level, LEVEL_COUNT, type Axis, type ClimateSample } from "../../world/climate";
import { BIOME, BIOME_NAMES, biomeID, type BiomeID } from "../../world/biomes/biomes";
import { BIOME_RULES } from "../../world/biomes/data";
import { levelsFor, type Box, type Rule } from "../../world/biomes/rules";

const CELL_COUNT = AXES.reduce((n, a) => n * LEVEL_COUNT[a], 1); // 12,250 cells
const UNSET = BIOME.NONE;

// index = sum(level[axis] * stride[axis]); last axis varies first
const stride = (() => {
    const s = {} as Record<Axis, number>;
    let acc = 1;
    for (let i = AXES.length - 1; i >= 0; i--) {
        s[AXES[i]!] = acc;
        acc *= LEVEL_COUNT[AXES[i]!];
    }
    return s;
})();

function forEachCell(box: Box, fn: (cell: number) => void) {
    const lists = AXES.map(a => levelsFor(a, box[a]));
    const walk = (i: number, idx: number) => {
        if (i === AXES.length) return fn(idx);
        const s = stride[AXES[i]!];
        for (const l of lists[i]!) walk(i + 1, idx + l * s);
    };
    walk(0, 0);
}

function describeCell(cell: number): string {
    let rem = cell;
    return AXES.map(a => {
        const l = Math.floor(rem / stride[a]);
        rem %= stride[a];
        return `${a}=${l}`;
    }).join(" ");
}

function buildGrid(rules: readonly Rule[]): Uint8Array {
    const grid = new Uint8Array(CELL_COUNT);
    const owner = new Int16Array(CELL_COUNT).fill(-1);

    rules.forEach((r, ri) => {
        const id = biomeID(r.biome);
        const boxes: readonly Box[] = Array.isArray(r.where) ? r.where : [r.where as Box];
        for (const box of boxes) {
            forEachCell(box, cell => {
                if (grid[cell] !== UNSET && owner[cell] !== ri && !r.over) {
                    throw new Error(
                        `overlap at [${describeCell(cell)}]: rule #${ri} (${r.biome}) vs ` +
                        `rule #${owner[cell]} (${BIOME_NAMES[grid[cell]!]}); use over:true if intended`
                    );
                }
                grid[cell] = id;
                owner[cell] = ri;
            });
        }
    });

    const gaps: number[] = [];
    for (let c = 0; c < CELL_COUNT; c++) if (grid[c] === UNSET) gaps.push(c);
    if (gaps.length) {
        throw new Error(
            `${gaps.length} uncovered cells, first few:\n` +
            gaps.slice(0, 8).map(c => " " + describeCell(c)).join("\n")
        );
    }

    const used = new Set(grid);
    const dead = BIOME_NAMES.filter(n => !used.has(biomeID(n)));
    if (dead.length) throw new Error(`biomes with no cells: ${dead.join(", ")}`);

    return grid;
}

export class BiomeSource {
    readonly grid: Uint8Array;

    constructor(rules: readonly Rule[] = BIOME_RULES) {
        this.grid = buildGrid(rules);
    }

    lookup(s: ClimateSample): BiomeID {
        const i =
            level("temperature", s.temperature) * stride.temperature +
            level("humidity", s.humidity) * stride.humidity +
            level("continentalness", s.continentalness) * stride.continentalness +
            level("erosion", s.erosion) * stride.erosion +
            level("weirdness", s.weirdness) * stride.weirdness +
            level("peaksValleys", s.peaksValleys) * stride.peaksValleys;
        return this.grid[i] as BiomeID;
    }
}

// dev
export function cellCounts(grid: Uint8Array): Map<string, number> {
    const m = new Map<string, number>();
    for (const b of grid) m.set(BIOME_NAMES[b]!, (m.get(BIOME_NAMES[b]!) ?? 0) + 1);
    return m;
}
