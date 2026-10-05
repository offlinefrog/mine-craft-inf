import { CLIMATE_PARAMS, type ClimateSample } from "./climate";

/** Stored per column in Chunk.biomes (a Uint8Array), so ids are integers 0..255. */
export type BiomeId = number;

/**
 * The dimensions a biome can constrain: the five climate parameters plus peaks-and-valleys.
 * Note peaksValleys is a function of weirdness (it folds |weirdness|), so these six are not
 * independent. PV says "valley / low / mid / high / peak"; weirdness additionally keeps its sign,
 * which PV discards, so it can still select "variant" biomes.
 */
export const BIOME_DIMENSIONS = [...CLIMATE_PARAMS, "peaksValleys"] as const;
export type BiomeDimension = (typeof BIOME_DIMENSIONS)[number];
const DIMS = BIOME_DIMENSIONS.length;

/** Closed interval [min, max] on one dimension. */
export type Interval = readonly [min: number, max: number];
export const FULL_RANGE: Interval = [-1, 1];
export const span = (min: number, max: number): Interval => [min, max];

export type BiomeParams = Record<BiomeDimension, Interval>;

/** Author a biome's box: list only the dimensions it cares about; the rest span the full range. */
export function biomeParams(constraints: Partial<BiomeParams> = {}): BiomeParams {
  const p = {} as BiomeParams;
  for (const d of BIOME_DIMENSIONS) p[d] = constraints[d] ?? FULL_RANGE;
  return p;
}

/**
 * Build a biome's boxes from a spec where each dimension is one interval or a list of
 * alternatives. The result is the cartesian product, one box per combination:
 *
 *   regions({ temperature: [T.at(0), T.at(2)], humidity: H.span(1, 3) })   // 2 boxes
 *
 * Unlisted dimensions span the full range. Adjacent levels should be merged with `Levels.span`
 * first, so a contiguous range stays one interval instead of several boxes.
 */
export function regions(
  spec: Partial<Record<BiomeDimension, Interval | readonly Interval[]>> = {},
): BiomeParams[] {
  let boxes: Partial<BiomeParams>[] = [{}];
  for (const dim of BIOME_DIMENSIONS) {
    const v = spec[dim];
    const alternatives: readonly Interval[] =
      v === undefined ? [FULL_RANGE] : typeof v[0] === "number" ? [v as Interval] : (v as readonly Interval[]);
    if (alternatives.length === 0) throw new Error(`regions(): ${dim} has an empty list of alternatives`);
    boxes = boxes.flatMap(b => alternatives.map(iv => ({ ...b, [dim]: iv })));
  }
  return boxes as BiomeParams[];
}

export interface BiomeDef {
  id: BiomeId;
  name: string;
  /**
   * The biome's area of climate space: a union of boxes. A point inside any one of them is at
   * distance 0 from the biome, and otherwise its distance is to the nearest box.
   */
  regions: readonly BiomeParams[];
  /**
   * Added to the distance (squared in the fitness). Makes a biome lose to any biome whose box
   * contains the point, so a rare biome only wins where it is clearly the best fit. Default 0.
   */
  offset?: number;
}

/**
 * Maps a climate point to a biome, following Minecraft's scheme: each biome owns one or more
 * boxes of intervals, and the point goes to the biome with the smallest
 *
 *   fitness = sum over dimensions of (distance from the point to that interval)^2 + offset^2
 *
 * (taking the nearest of a biome's boxes). A point inside a box has distance 0 on every dimension. Points outside every box (gaps) still
 * get the nearest biome, so the table never has holes. Ties go to the biome listed first, so the
 * result is a pure function of the point and the table: never of lookup order.
 *
 * Internally the boxes of all biomes are flattened into one list, as Minecraft does. Linear scan
 * with early exit. That is plenty for tens to a few hundred entries
 * (microseconds per lookup); swap in an R-tree inside `find` if the table grows far beyond that.
 */
/** Anything that maps a climate point to a biome id: the box table, or a baked level grid. */
export interface BiomeLookup {
  find(c: ClimateSample): BiomeId;
}

export class BiomeTable implements BiomeLookup {
  private readonly count: number;           // total boxes across all biomes
  private readonly owner: Int32Array;       // box -> index into defs
  private readonly min: Float64Array;       // count * DIMS, row-major per box
  private readonly max: Float64Array;
  private readonly penalty: Float64Array;   // offset^2 per box

  readonly defs: readonly BiomeDef[];

  constructor(defs: readonly BiomeDef[]) {
    if (defs.length === 0) throw new Error("BiomeTable needs at least one biome");
    const ids = new Set<number>();
    this.count = defs.reduce((n, d) => n + d.regions.length, 0);
    this.owner = new Int32Array(this.count);
    this.min = new Float64Array(this.count * DIMS);
    this.max = new Float64Array(this.count * DIMS);
    this.penalty = new Float64Array(this.count);
    let box = 0;
    defs.forEach((def, defIndex) => {
      if (!Number.isInteger(def.id) || def.id < 0 || def.id > 255) throw new Error(`Biome "${def.name}": id must be an integer 0..255`);
      if (ids.has(def.id)) throw new Error(`Duplicate biome id ${def.id}`);
      ids.add(def.id);
      if (def.regions.length === 0) throw new Error(`Biome "${def.name}" has no regions`);
      const offset = def.offset ?? 0;
      if (offset < 0) throw new Error(`Biome "${def.name}": offset must be >= 0`);
      for (const region of def.regions) {
        this.owner[box] = defIndex;
        this.penalty[box] = offset * offset;
        BIOME_DIMENSIONS.forEach((dim, d) => {
          const [lo, hi] = region[dim];
          if (!(lo <= hi)) throw new Error(`Biome "${def.name}": ${dim} interval has min > max`);
          this.min[box * DIMS + d] = lo;
          this.max[box * DIMS + d] = hi;
        });
        box++;
      }
    });

    this.defs = defs;
  }

  find(c: ClimateSample): BiomeId {
    const v = [c.temperature, c.humidity, c.continentalness, c.erosion, c.weirdness, c.peaksValleys];
    let bestFit = Infinity, best = 0;
    for (let i = 0; i < this.count; i++) {
      let fit = this.penalty[i];
      const base = i * DIMS;
      for (let d = 0; d < DIMS && fit < bestFit; d++) {
        const x = v[d], lo = this.min[base + d], hi = this.max[base + d];
        const dist = x < lo ? lo - x : x > hi ? x - hi : 0;
        fit += dist * dist;
      }
      // Strict "<" keeps the earliest-listed box (so biome) on ties. Fitness 0 can't be beaten, so stop.
      if (fit < bestFit) { bestFit = fit; best = i; if (fit === 0) break; }
    }
    return this.defs[this.owner[best]].id;
  }
}
