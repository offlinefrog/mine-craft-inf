import { BIOME_NAMES, type BiomeName } from "./biomes";
import { AXES, LEVEL_COUNT, WEIRDNESS as W, type Axis } from "../climate";

export type Range = readonly [number, number];
export type LevelSpec = number | Range | readonly Range[];
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

export function levelsFor(axis: Axis, spec: LevelSpec | undefined): number[] {
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
