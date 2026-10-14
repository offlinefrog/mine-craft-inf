export const AXES = [
    "temperature", "humidity", "continentalness", "erosion", "weirdness", "peaksValleys"
] as const;
export type Axis = (typeof AXES)[number];

const THRESHOLDS: Readonly<Record<Axis, readonly number[]>> = {
    temperature:        [-0.45, -0.15, 0.2, 0.55],                  // 5 levels
    humidity:           [-0.35, -0.10, 0.1, 0.30],                  // 5 levels
    continentalness:    [-1.05, -0.455, -0.190, -0.11, 0.03, 0.30], // 7 levels
    erosion:            [-0.78, -0.375, -0.2225, 0.05, 0.45, 0.55], // 7 levels
    weirdness:          [0],                                        // 2 levels
    peaksValleys:       [-0.85, -0.2, 0.2, 0.7]                     // 5 levels
};

export const LEVEL_COUNT = Object.fromEntries(
    AXES.map(a => [a, THRESHOLDS[a].length + 1])
) as Readonly<Record<Axis, number>>;

export const TEMPERATURE = { Frozen: 0, Cool: 1, Neutral: 2, Warm: 3, Hot: 4 } as const;
export const HUMIDITY = { Arid: 0, Dry: 1, Neutral: 2, Wet: 3, Humid: 4 } as const;
export const CONTINENTALNESS = {
    Mushroom: 0, DeepOcean: 1, Ocean: 2, Coast: 3,
    NearInland: 4, MidInland: 5, FarInland: 6
} as const;
export const EROSION = { L0: 0, L1: 1, L2: 2, L3: 3, L4: 4, L5: 5, L6: 6 } as const; // from 0: hilly to 6: flat
export const WEIRDNESS = { Neg: 0, Pos: 1 } as const;
export const PEAKSVALLEYS = { Valleys: 0, Low: 1, Mid: 2, High: 3, Peaks: 4 } as const;

// raw noise values generally within [-1, 1]
export type ClimateSample = Record<Axis, number>;

export function level(axis: Axis, v: number): number {
    const t = THRESHOLDS[axis];
    let i = 0;
    while (i < t.length && v >= t[i]!) i++
    return i;
}
