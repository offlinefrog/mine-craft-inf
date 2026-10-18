import { describe, expect, it } from "vitest";
import { hash } from "../../noise/hash";
import { Simplex2D, SIMPLEX_SD } from "../../noise/simplex";
import { OctaveNoise, type OctaveConfig } from "../../noise/octave";
import { OctaveNoise3, Perlin3, PERLIN3_SD, type Octave3Config } from "../../noise/perlin3";

const N = 200_000;
const EXTENT = 20_000;
const u = (seed: number, i: number, k: number) => hash(seed, i, k) / 2 ** 32 - 0.5;

type Point = [number, number] | [number, number, number];

const point = (seed: number, i: number, dim: number): number[] =>
    Array.from({ length: dim }, (_, j) => u(seed, i, j+ 1) * EXTENT) as Point;

function stats(f: (...p: number[]) => number, seed = 7) {
    const dim = f.length;
    let sum = 0, sumSq = 0, max = 0;

    for (let i = 0; i < N; i++) {
        const v = f(...point(seed, i, dim));
        sum += v; sumSq += v * v; max = Math.max(max, Math.abs(v));
    }

    const mean = sum / N;
    return { mean, sd: Math.sqrt(sumSq / N - mean * mean), max };
}

function structure(f: (x: number, y: number, z: number) => number, axis: 0 | 1 | 2, d: number, seed = 11) {
    let s = 0;
    for (let i = 0; i < N; i++) {
        const p = point(seed, i, 3) as [number, number, number];
        const q = [...p] as [number, number, number];

        q[axis] += d;

        const diff = f(...q) - f(...p);
        s += diff * diff;
    }
    return s / N;
}

describe("Simplex2D", () => {
    it("has the sd declared as SIMPLEX_SD", () => {
        const n = new Simplex2D(1);
        // frequency 1/32 so the region spans many cells
        const { mean, sd } = stats((x, z) => n.noise(x / 32, z / 32));
        console.log("measured Simplex2D sd:", sd);
        expect(Math.abs(mean)).toBeLessThan(0.01);
        expect(Math.abs(sd - SIMPLEX_SD) / SIMPLEX_SD).toBeLessThan(0.02);
    });
});

describe("OctaveNoise", () => {
    const configs: [string, OctaveConfig][] = [
        ["single octave",         { wavelength: 32, amplitudes: [1] }],
        ["falloff only",          { wavelength: 32, amplitudes: [1, 1, 1, 1] }],
        ["boosted detail",        { wavelength: 32, amplitudes: [1, 2, 4, 4] }],
        ["skipped octave",        { wavelength: 32, amplitudes: [1.5, 0, 0.75] }],
        ["only a high octave",    { wavelength: 64, amplitudes: [0, 0, 1] }],
        ["default continentalness", { wavelength: 32, amplitudes: [1, 0.5, 0.25] }],
    ];

    it.each(configs)("has mean approx. 0, sd approx. 1, and bounded range %s", (_name, config) => {
        for (const seed of [1, 12345, -99]) {
            const noise = new OctaveNoise(seed, 1, config);
            const { mean, sd } = stats((x, z) => noise.sample(x, z));
            expect(Math.abs(mean), `mean, seed ${seed}`).toBeLessThan(0.03);
            expect(Math.abs(sd - 1), `sd, seed ${seed}`).toBeLessThan(0.02);
        }
    });

    it("sd does not depend on wavelength", () => {
        for (const wavelength of [16, 32, 64]) {
            const noise = new OctaveNoise(5, 1, { wavelength, amplitudes: [1, 0.5] });
            expect(Math.abs(stats((x, z) => noise.sample(x, z)).sd - 1)).toBeLessThan(0.02);
        }
    });

    it("sd does not depend on salt", () => {
        for (const salt of [0, 1, 7]) {
            const noise = new OctaveNoise(5, salt, { wavelength: 32, amplitudes: [1, 1] });
            expect(Math.abs(stats((x, z) => noise.sample(x, z)).sd - 1)).toBeLessThan(0.02);
        }
    });

    it("different salts give uncorrelated fields", () => {
        const a = new OctaveNoise(5, 1, { wavelength: 32, amplitudes: [1, 1] });
        const b = new OctaveNoise(5, 2, { wavelength: 32, amplitudes: [1, 1] });
        const { mean } = stats((x, z) => a.sample(x, z) * b.sample(x, z));
        expect(Math.abs(mean)).toBeLessThan(0.03);
    });
});

describe("Perlin3", () => {
    const n = new Perlin3(1);

    it("has the sd declared as PERLIN3_SD", () => {
        const { mean, sd } = stats((x, y, z) => n.noise(x / 16, y / 16, z / 16));
        console.log("measured Perlin3 sd:", sd);
        expect(Math.abs(mean)).toBeLessThan(0.01);
        expect(Math.abs(sd - PERLIN3_SD) / PERLIN3_SD).toBeLessThan(0.02);
    });

    it("stays within [-1, 1]", () => {
        expect(stats((x, y, z) => n.noise(x / 16, y / 16, z / 16)).max).toBeLessThanOrEqual(1 + 1e-9);
    });

    it("is zero at integer lattice points", () => {
        for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) for (let k = -3; k <= 3; k++)
            expect(Math.abs(n.noise(i, j, k))).toBeLessThan(1e-12);
    });

    it("is continuous", () => {
        for (let i = 0; i < 2000; i++) {
            const [x, y, z] = point(3, i, 3).map(v => v / 100) as [number, number, number];
            const e = 1e-3;
            expect(Math.abs(n.noise(x + e, y, z) - n.noise(x, y, z))).toBeLessThan(0.02);
            expect(Math.abs(n.noise(x, y + e, z) - n.noise(x, y, z))).toBeLessThan(0.02);
            expect(Math.abs(n.noise(x, y, z + e) - n.noise(x, y, z))).toBeLessThan(0.02);
        }
    });
    
    it("is periodic with period 256 per axis (lattice wrap), and wraps for negatives", () => {
        for (let i = 0; i < 200; i++) {
            const [x, y, z] = point(5, i, 3).map(v => v / 50) as [number, number, number];
            expect(n.noise(x + 256, y, z)).toBeCloseTo(n.noise(x, y, z), 9);
            expect(n.noise(x, y - 256, z + 512)).toBeCloseTo(n.noise(x, y, z), 9);
        }
    });

    it("is deterministic per seed and differs across seeds and salts", () => {
        const a = new Perlin3(1), b = new Perlin3(2), c = new Perlin3(1, 1);
        let diffSeed = 0, diffSalt = 0;
        for (let i = 0; i < 200; i++) {
            const [x, y, z] = point(9, i, 3).map(v => v / 20) as [number, number, number];
            expect(a.noise(x, y, z)).toBe(n.noise(x, y, z));
            if (a.noise(x, y, z) !== b.noise(x, y, z)) diffSeed++;
            if (a.noise(x, y, z) !== c.noise(x, y, z)) diffSalt++;
        }
        expect(diffSeed).toBeGreaterThan(150);
        expect(diffSalt).toBeGreaterThan(150);
    });
});

describe("OctaveNoise3", () => {
    const configs: [string, Octave3Config][] = [
        ["single octave",       { wavelengthXZ: 32, wavelengthY: 64, amplitudes: [1] }],
        ["falloff only",        { wavelengthXZ: 32, wavelengthY: 64, amplitudes: [1, 1, 1] }],
        ["boosted detail",      { wavelengthXZ: 32, wavelengthY: 64, amplitudes: [1, 2, 4] }],
        ["skipped octave",      { wavelengthXZ: 32, wavelengthY: 64, amplitudes: [1.5, 0, 0.75] }],
        ["only finest allowed", { wavelengthXZ: 32, wavelengthY: 64, amplitudes: [0, 0, 1] }],
    ];

    it.each(configs)("has mean approx. 0, sd approx. 1, and bounded range %s", (_name, config) => {
        for (const seed of [1, 12345, -99]) {
            const noise = new OctaveNoise3(seed, 1, config);
            const { mean, sd } = stats((x, y, z) => noise.sample(x, y, z));
            expect(Math.abs(mean), `mean, seed ${seed}`).toBeLessThan(0.03);
            expect(Math.abs(sd - 1), `sd, seed ${seed}`).toBeLessThan(0.02);
        }
    });

    it("sd does not depend on salt", () => {
        for (const salt of [0, 1, 7]) {
            const noise = new OctaveNoise3(5, salt, configs[1]![1]);
            expect(Math.abs(stats((x, y, z) => noise.sample(x, y, z)).sd - 1)).toBeLessThan(0.02);
        }
    });

    it("different salts give uncorrelated fields", () => {
        const a = new OctaveNoise3(5, 1, configs[1]![1]);
        const b = new OctaveNoise3(5, 2, configs[1]![1]);
        expect(Math.abs(stats((x, y, z) => a.sample(x, y, z) * b.sample(x, y, z)).mean)).toBeLessThan(0.03);
    });

    it("wavelengthY stretches features vertically", () => {
        const noise = new OctaveNoise3(3, 1, { wavelengthXZ: 32, wavelengthY: 128, amplitudes: [1] });
        const f = (x: number, y: number, z: number) => noise.sample(x, y, z);
        expect(structure(f, 1, 4)).toBeLessThan(0.25 * structure(f, 0, 4));
    });

    it("is roughly isotropic in x and z (loose bound)", () => {
        const noise = new OctaveNoise3(3, 1, { wavelengthXZ: 32, wavelengthY: 64, amplitudes: [1, 1, 1] });
        const f = (x: number, y: number, z: number) => noise.sample(x, y, z);
        const ratio = structure(f, 0, 4) / structure(f, 2, 4);
        expect(ratio).toBeGreaterThan(0.8);
        expect(ratio).toBeLessThan(1.25);
    });

    describe("aliasing guard", () => {
        it("rejects octaves finer than the lattice can resolve", () => {
            expect(() => new OctaveNoise3(1, 1, { wavelengthXZ: 16, wavelengthY: 64, amplitudes: [1, 1, 1] })).toThrow(/aliases/); // xz: octave 2 = 4
            expect(() => new OctaveNoise3(1, 1, { wavelengthXZ: 64, wavelengthY: 32, amplitudes: [1, 1, 1] })).toThrow(/aliases/); // y: octave 2 = 8
        });
        it("accepts the exact limit and ignores skipped fine octaves", () => {
            expect(() => new OctaveNoise3(1, 1, { wavelengthXZ: 32, wavelengthY: 64, amplitudes: [1, 1, 1] })).not.toThrow(); // 8, 16
            expect(() => new OctaveNoise3(1, 1, { wavelengthXZ: 32, wavelengthY: 64, amplitudes: [1, 1, 1, 0, 0] })).not.toThrow();
        });
        it("rejects empty, all-zero, negative and non-finite configs", () => {
            const base = { wavelengthXZ: 32, wavelengthY: 64 };
            expect(() => new OctaveNoise3(1, 1, { ...base, amplitudes: [] })).toThrow();
            expect(() => new OctaveNoise3(1, 1, { ...base, amplitudes: [0, 0] })).toThrow();
            expect(() => new OctaveNoise3(1, 1, { ...base, amplitudes: [1, -1] })).toThrow();
            expect(() => new OctaveNoise3(1, 1, { ...base, amplitudes: [NaN] })).toThrow();
        });
    });
})
