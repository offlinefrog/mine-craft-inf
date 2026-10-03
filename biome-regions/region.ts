import { BIOME_DIMENSIONS, DIMENSION_SIZE, type BiomeRegion } from "./biome";

/** Named level indices, so tables read like the wiki. */
export const CONT = { MUSHROOM_FIELDS: 0, DEEP_OCEAN: 1, OCEAN: 2, COAST: 3, NEAR_INLAND: 4, MID_INLAND: 5, FAR_INLAND: 6 } as const;
export const PVL = { VALLEYS: 0, LOW: 1, MID: 2, HIGH: 3, PEAKS: 4 } as const;
export const WEIRD = { NEGATIVE: 0, POSITIVE: 1 } as const;

/** Your biomeSpace(), with the default fixed: intervals are inclusive, so a full range ends at size - 1. */
export function biomeSpace(constraints: Partial<BiomeRegion> = {}): BiomeRegion {
    const br = {} as BiomeRegion;
    for (const d of BIOME_DIMENSIONS) {
        br[d] = constraints[d] ?? [0, DIMENSION_SIZE[d] - 1];
    }
    return br;
}

const KEY = { T: "temperature", H: "humidity", C: "continentalness", E: "erosion", W: "weirdness", PV: "PV" } as const;
type Level = number | readonly [number, number];

/** Short-key constraints: `{ T: 0, H: [0, 1] }` = temperature level 0, humidity levels 0..1. Omitted = any level. */
export type Where = { [K in keyof typeof KEY]?: Level };

export function at(where: Where = {}): BiomeRegion {
    const region = biomeSpace();
    for (const key of Object.keys(KEY) as (keyof typeof KEY)[]) {
        const v = where[key];
        if (v === undefined) continue;
        const [lo, hi] = typeof v === "number" ? [v, v] : v;
        const dim = KEY[key];
        if (lo > hi || lo < 0 || hi >= DIMENSION_SIZE[dim]) throw new RangeError(`${key}=[${lo},${hi}] is outside levels 0..${DIMENSION_SIZE[dim] - 1}`);
        region[dim] = [lo, hi];
    }
    return region;
}

/** The box where both a and b hold, or undefined if they don't overlap. */
export function intersect(a: BiomeRegion, b: BiomeRegion): BiomeRegion | undefined {
    const out = {} as BiomeRegion;
    for (const d of BIOME_DIMENSIONS) {
        const lo = Math.max(a[d][0], b[d][0]), hi = Math.min(a[d][1], b[d][1]);
        if (lo > hi) return undefined;
        out[d] = [lo, hi];
    }
    return out;
}
