import { BIOME_NAMES, biomeID, type BiomeName } from "./biomes";
import { AXES, LEVEL_COUNT, WEIRDNESS as W, type Axis } from "../climate";

const CELL_COUNT = AXES.reduce((n, a) => n * LEVEL_COUNT[a], 1); // 12,250 cells

type Range = readonly [number, number];
type LevelSpec = number | Range | readonly Range[];
export type Box = Partial<Record<Axis, LevelSpec>>;

export interface Rule {
    readonly biome: BiomeName;
    readonly where: Box | readonly Box[];
    readonly over?: boolean;
}
export const rule = (
    biome: BiomeName, where: Box | readonly Box[] = {}, over = false
): Rule => ({ biome, where, over });

export type Cell = BiomeName | readonly [negW: BiomeName, posW: BiomeName];

const cellRules = (cell: Cell, box: Box): Rule[] =>
    typeof cell === "string"
    ? [rule(cell, box)]
    : [rule(cell[0], { ...box, weirdness: W.Neg }), rule(cell[1], { ...box, weirdness: W.Pos })];

export const thTable = (where: Box, table: readonly (readonly Cell[])[]): Rule[] =>
    table.flatMap((row, t) =>
        row.flatMap((cell, h) => cellRules(cell, { ...where, temperature: t, humidity: h})));

export const byLevel = (axis: Axis, where: Box, cells: readonly Cell[]): Rule[] =>
    cells.flatMap((cell, level) => cellRules(cell, { ...where, [axis]: level }));

function toRanges(levels: readonly number[]): Range[] {
    const out: Range[] = [];
    let lo = levels[0]!, prev = lo;
    for (const l of levels.slice(1)) {
        if (l !== prev + 1) { out.push([lo, prev]); lo = l; }
        prev = l;
    }
    out.push([lo, prev]);
    return out;
}

export function and(a: Box, b: Box): Box | null {
    const out: Partial<Record<Axis, LevelSpec>> = {};
    for (const ax of AXES) {
        const inB = new Set(levelsFor(ax, b[ax]));
        const both = levelsFor(ax, a[ax]).filter(l => inB.has(l)).sort((x, y) => x - y);
        if (both.length === 0) return null;
        out[ax] = toRanges(both);
    }
    return out;
}

export type Category = (where: Box) => Rule[];
export const category = (
    rules: readonly Rule[]
): Category => where => rules.flatMap(r => {
    const boxes: readonly Box[] = Array.isArray(r.where) ? r.where : [r.where as Box];
    const hit = boxes.map(b => and(where, b)).filter((b): b is Box => b !== null);
    return hit.length ? [rule(r.biome, hit)]: [];
});

// builing grid

function levelsFor(axis: Axis, spec: LevelSpec | undefined): number[] {
    const n = LEVEL_COUNT[axis];
    if (spec === undefined) return Array.from({ length: n }, (_, i) => i);

    const ranges: readonly Range[] =
        typeof spec === "number" ? [[spec, spec]]
        : typeof spec[0] === "number" ? [spec as Range]
        : (spec as readonly Range[]);

    const out = new Set<number>;
    for (const [lo, hi] of ranges) {
        if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo > hi || lo < 0 || hi >= n) {
            throw new RangeError(`${axis}: bad level range [${lo}, ${hi}] for axis ${axis}: valid levels are 0..${n - 1}`);
        }
        for (let l = lo; l <= hi; l++) out.add(l);
    }
    return [...out];
}

// index = sum(level[axis] * stride[axis]); last axis varies first
export const stride = (() => {
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

const UNSET = 255;

function describe(cell: number): string {
    let rem = cell;
    return AXES.map(a => {
        const l = Math.floor(rem / stride[a]);
        rem %= stride[a];
        return `${a}=${l}`;
    }).join(" ");
}

export function buildGrid(rules: readonly Rule[]): Uint8Array {
    const grid = new Uint8Array(CELL_COUNT).fill(UNSET);
    const owner = new Int16Array(CELL_COUNT).fill(-1);

    rules.forEach((r, ri) => {
        const id = biomeID(r.biome);
        const boxes: readonly Box[] = Array.isArray(r.where) ? r.where : [r.where as Box];
        for (const box of boxes) {
            forEachCell(box, cell => {
                if (grid[cell] !== UNSET && owner[cell] !== ri && !r.over) {
                    throw new Error(
                        `overlap at [${describe(cell)}]: rule #${ri} (${r.biome}) vs ` +
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
            gaps.slice(0, 8).map(c => " " + describe(c)).join("\n")
        );
    }

    const used = new Set(grid);
    const dead = BIOME_NAMES.filter(n => !used.has(biomeID(n)));
    if (dead.length) throw new Error(`biomes with no cells: ${dead.join(", ")}`);

    return grid;
}

// dev
export function cellCounts(grid: Uint8Array): Map<string, number> {
    const m = new Map<string, number>();
    for (const b of grid) m.set(BIOME_NAMES[b]!, (m.get(BIOME_NAMES[b]!) ?? 0) + 1);
    return m;
}
