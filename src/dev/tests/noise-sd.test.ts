import { describe, expect, it } from "vitest";
import { Simplex2D, SIMPLEX_SD } from "../../noise/simplex";
import { OctaveNoise, type OctaveConfig } from "../../noise/octave";
import { hash } from "../../noise/hash";

const N = 200_000;
const EXTENT = 20_000;

function stats(sample: (x: number, z: number) => number, seed = 7) {
  let sum = 0, sumSq = 0;
  for (let i = 0; i < N; i++) {
    const x = (hash(seed, i, 1) / 2 ** 32 - 0.5) * EXTENT;
    const z = (hash(seed, i, 2) / 2 ** 32 - 0.5) * EXTENT;
    const v = sample(x, z);
    sum += v; sumSq += v * v;
  }
  const mean = sum / N;
  return { mean, sd: Math.sqrt(sumSq / N - mean * mean) };
}

describe("Simplex2D", () => {
  it("has the sd declared as SIMPLEX_SD", () => {
    const n = new Simplex2D(1);
    // frequency 1/32 so the region spans many cells
    const { mean, sd } = stats((x, z) => n.noise(x / 32, z / 32));
    expect(Math.abs(mean)).toBeLessThan(0.01);
    expect(sd).toBeCloseTo(SIMPLEX_SD, 1);               // within ~0.05
    expect(Math.abs(sd - SIMPLEX_SD) / SIMPLEX_SD).toBeLessThan(0.02);
  });
});

describe("OctaveNoise normalization", () => {
  const configs: [string, OctaveConfig][] = [
    ["single octave",         { wavelength: 32, amplitudes: [1] }],
    ["falloff only",          { wavelength: 32, amplitudes: [1, 1, 1, 1] }],
    ["boosted detail",        { wavelength: 32, amplitudes: [1, 2, 4, 4] }],
    ["skipped octave",        { wavelength: 32, amplitudes: [1.5, 0, 0.75] }],
    ["only a high octave",    { wavelength: 64, amplitudes: [0, 0, 1] }],
    ["default continentalness", { wavelength: 32, amplitudes: [1, 0.5, 0.25] }],
  ];

  it.each(configs)("has mean ≈ 0 and sd ≈ 1: %s", (_name, config) => {
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
    const { mean } = stats((x, z) => a.sample(x, z) * b.sample(x, z)); // E[ab] = covariance
    expect(Math.abs(mean)).toBeLessThan(0.03);
  });
});
