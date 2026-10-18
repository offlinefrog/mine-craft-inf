// control point [input, output]
export type SplinePoint = readonly [x: number, y: number];

export interface SplineOptions {
    // zero slope at end points
    flatEnds?: boolean;
}

// smooth 1D cubic Hermite curve with monotone tangents (Fritsch-Carlson) through points
// c1, no overshoot between points, constant outside first and last x
export class Spline {
    private readonly xs: Float64Array;
    private readonly ys: Float64Array;
    private readonly ms: Float64Array;

    constructor(points: readonly SplinePoint[], options: SplineOptions = {}) {
        const n = points.length;
        if (n === 0) throw new Error('Spline needs at least one point');

        for (const [x, y] of points) {
            if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("Spline points must be finite");
        }

        this.xs = Float64Array.from(points, p => p[0]);
        this.ys = Float64Array.from(points, p => p[1]);

        for (let i = 1; i < n; i++) {
            if (!(this.xs[i] > this.xs[i - 1])) throw new Error('Spline points must have increasing x');
        }

        this.ms = new Float64Array(n);
        if (n === 1) return;

        const h = new Float64Array(n - 1), d = new Float64Array(n - 1);
        for (let i = 0; i < n - 1; i++) {
            h[i] = this.xs[i + 1] - this.xs[i];
            d[i] = (this.ys[i + 1] - this.ys[i]) / h[i];
        }

        this.ms[0] = options.flatEnds ? 0 : d[0];
        this.ms[n - 1] = options.flatEnds ? 0 : d[n - 2];

        for (let i = 1; i < n - 1; i++) {
            if (d[i - 1] * d[i] <= 0) {
                this.ms[i] = 0;     // local extreme or flat: zero slope
                continue;
            }
            // weighted harmonic mean of neighboring slopes
            const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
            this.ms[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
        }
    }

    eval(x: number): number {
        const { xs, ys, ms } = this;
        const n = xs.length;
        
        if (Number.isNaN(x)) return NaN;
        if (x <= xs[0]) return ys[0];
        if (x >= xs[n - 1]) return ys[n - 1];

        // binary search for largest i with xs[i] <= x
        let lo = 0, hi = n - 1;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (xs[mid] <= x) lo = mid; else hi = mid;
        }
        const i = lo;

        const h = xs[i + 1] - xs[i];
        const t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;

        return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * ms[i]
            + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * ms[i + 1];
    }
}
