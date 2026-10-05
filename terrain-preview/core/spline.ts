/** A control point: [input, output]. */
export type SplinePoint = readonly [x: number, y: number];

/**
 * A smooth 1D curve through control points. Between points it is a cubic Hermite curve with
 * monotone tangents (Fritsch-Carlson), so it never overshoots: if the points rise, the curve rises.
 * Outside the first/last point it holds the end value. Pure arithmetic, so deterministic.
 *
 * Terrain shape is described by a handful of these (e.g. continentalness -> base height).
 */
export class Spline {
  private readonly xs: Float64Array;
  private readonly ys: Float64Array;
  private readonly ms: Float64Array;   // tangent at each point

  constructor(points: readonly SplinePoint[]) {
    const n = points.length;
    if (n === 0) throw new Error("Spline needs at least one point");
    this.xs = Float64Array.from(points, p => p[0]);
    this.ys = Float64Array.from(points, p => p[1]);
    for (let i = 1; i < n; i++) if (!(this.xs[i] > this.xs[i - 1])) throw new Error("Spline points must have increasing x");
    this.ms = new Float64Array(n);
    if (n === 1) return;
    const h = new Float64Array(n - 1), d = new Float64Array(n - 1);
    for (let i = 0; i < n - 1; i++) { h[i] = this.xs[i + 1] - this.xs[i]; d[i] = (this.ys[i + 1] - this.ys[i]) / h[i]; }
    this.ms[0] = d[0];
    this.ms[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) { this.ms[i] = 0; continue; }          // local extremum or flat: zero slope
      const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];       // weighted harmonic mean of neighbouring slopes
      this.ms[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }

  eval(x: number): number {
    const { xs, ys, ms } = this;
    const n = xs.length;
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;                                         // few points: a linear scan is fastest
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * ms[i]
         + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * ms[i + 1];
  }
}
