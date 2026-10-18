import { describe, it, expect } from "vitest";
import { hash } from "../../noise/hash";
import { Spline, type SplinePoint } from "../../noise/spline";

const rnd = (seed: number, i: number) => hash(seed, i, 0) / 2 ** 32;

describe("Spline", () => {
    const pts: SplinePoint[] = [[-1, 0], [-0.2, 10], [0.1, 12], [0.5, 30], [1, 30]];

    it("passes through its control points", () => {
        const s = new Spline(pts);
        for (const [x, y] of pts) expect(s.eval(x)).toBeCloseTo(y, 12);
    });

    it("clamps outside the range", () => {
        const s = new Spline(pts);
        expect(s.eval(-50)).toBe(0);
        expect(s.eval(50)).toBe(30);
        expect(s.eval(-Infinity)).toBe(0);
        expect(s.eval(Infinity)).toBe(30);
    });

    it("handles a single point and returns NaN for NaN input", () => {
        const s = new Spline([[0, 7]]);
        expect(s.eval(-3)).toBe(7);
        expect(s.eval(3)).toBe(7);
        expect(new Spline(pts).eval(NaN)).toBeNaN();
    });

    it("reproduces linear data exactly, even with uneven spacing", () => {
        const lin: SplinePoint[] = [[0, 1], [0.1, 1.2], [0.7, 2.4], [2, 5]]; // y = 2x + 1
        const s = new Spline(lin);
        for (let i = 0; i < 200; i++) {
            const x = rnd(1, i) * 2;
            expect(s.eval(x)).toBeCloseTo(2 * x + 1, 10);
        }
    });

    it("is monotone and never overshoots for monotone data (random)", () => {
        for (let trial = 0; trial < 50; trial++) {
            const n = 3 + (trial % 6);
            let x = 0, y = 0;
            const p: SplinePoint[] = [];
            for (let i = 0; i < n; i++) {
                p.push([x, y]);
                x += 0.05 + rnd(trial, 2 * i); // uneven spacing
                y += rnd(trial, 2 * i + 1) < 0.2 ? 0 : rnd(trial, 2 * i + 1) * 20; // includes flat runs
            }
            const s = new Spline(p);
            let prev = -Infinity;
            for (let i = 0; i < n - 1; i++)
                for (let k = 0; k <= 50; k++) {
                    const xx = p[i]![0] + (p[i + 1]![0] - p[i]![0]) * (k / 50);
                    const v = s.eval(xx);
                    expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
                    expect(v).toBeGreaterThanOrEqual(p[i]![1] - 1e-9);
                    expect(v).toBeLessThanOrEqual(p[i + 1]![1] + 1e-9);
                    prev = v;
                }
        }
    });

    it("is flat at local extrema", () => {
        const s = new Spline([[0, 0], [1, 5], [2, 0]]);
        const e = 1e-6;
        expect(Math.abs((s.eval(1 + e) - s.eval(1 - e)) / (2 * e))).toBeLessThan(1e-4);
        expect(s.eval(0.5)).toBeLessThanOrEqual(5);
        expect(s.eval(1.5)).toBeLessThanOrEqual(5);
    });

    it("is C1 at interior knots", () => {
        const s = new Spline(pts);
        const e = 1e-6;
        for (const [x] of pts.slice(1, -1)) {
            const left = (s.eval(x) - s.eval(x - e)) / e;
            const right = (s.eval(x + e) - s.eval(x)) / e;
            expect(Math.abs(left - right)).toBeLessThan(1e-3);
        }
    });

    describe("flatEnds", () => {
        it("makes the slope zero at both ends, otherwise it matches the end segments", () => {
            const e = 1e-6;
            const flat = new Spline(pts, { flatEnds: true });
            expect(Math.abs((flat.eval(-1 + e) - flat.eval(-1)) / e)).toBeLessThan(1e-3);
            expect(Math.abs((flat.eval(1) - flat.eval(1 - e)) / e)).toBeLessThan(1e-3);

            const plain = new Spline([[0, 0], [1, 2]]);
            expect((plain.eval(e) - plain.eval(0)) / e).toBeCloseTo(2, 3); // linear, slope 2 at the end
        });
    });

    describe("validation", () => {
        it("rejects bad input", () => {
            expect(() => new Spline([])).toThrow();
            expect(() => new Spline([[0, 0], [0, 1]])).toThrow();   // equal x
            expect(() => new Spline([[1, 0], [0, 1]])).toThrow();   // decreasing x
            expect(() => new Spline([[NaN, 0], [1, 1]])).toThrow(); // NaN in first x
            expect(() => new Spline([[0, 0], [1, NaN]])).toThrow(); // NaN y
            expect(() => new Spline([[0, 0], [Infinity, 1]])).toThrow();
        });
    });

});
