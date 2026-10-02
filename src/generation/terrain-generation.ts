import { CHUNK_SIZE, DEPTH, H_SCALE, lvl, SEA_LEVEL, TOP, V_SCALE } from '../config';
import { splitmix32, Simplex } from '../noise';

import { BLOCK } from "../blocks/block";

import { Chunk, PADDING } from '../world/chunk';

import { pickBiome, rocky, snowy, type SurfaceRule } from './biomes';
import { ClimateMap } from './climate';

/** smoothens a crease over band of width k */
const smin = (a: number, b: number, k: number) => {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.min(a, b) - h * h * k * 0.25;
}

const smoothstep = (a: number, b: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
}

// continentalness -> base height (from deep ocean to inland)
const R = TOP - SEA_LEVEL;
const SPLINE: [number, number][] = [
    [-1,    SEA_LEVEL * 0.2],
    [-0.5,  SEA_LEVEL * 0.43],
    [-0.25, SEA_LEVEL * 0.78],
    [-0.1,  SEA_LEVEL - 1],
    [0,     SEA_LEVEL + 2],
    [0.3,   SEA_LEVEL + 0.15 * R],
    [1,     SEA_LEVEL + 0.26 * R]
];
const ALPINE = lvl(0.93);

function spline(v: number) {
    for (let i = 1; i < SPLINE.length; i++) {
        if (v <= SPLINE[i][0]) {
            const [x0, y0] = SPLINE[i - 1], [x1, y1] = SPLINE[i];
            return y0 + ((y1 - y0) * (v - x0)) / (x1 - x0);
        }
    }

    return SPLINE[SPLINE.length - 1][1];
}

// if top block, plants can grow
const SOIL = new Set<number>([BLOCK.GRASS_BLOCK, BLOCK.PODZOL, BLOCK.SAND, BLOCK.RED_SAND, BLOCK.DIRT]);

export class TerrainGenerator {
    private noise: Simplex;
    private climate: ClimateMap;

    private riverWarp: Simplex;
    private river: Simplex;

    constructor(seed: number) {
        this.noise = new Simplex(seed);
        this.climate = new ClimateMap(seed);

        this.riverWarp = new Simplex(seed + 101);
        this.river = new Simplex(seed + 103);
    }

    grove(x: number, z: number) {
        return 0.25 + 1.5 * Math.min(1, Math.max(0, this.noise.noise(x * 0.025 + 77, z * 0.025) + 0.5));
    }

    /** height, climate, biome of a world column; height is dependent on climate only */
    column(x: number, z: number) {
        const c = this.climate.sample(x, z);
        const relief = ((1 - (c.erosion + 1) / 2)) ** 2;    // 1 = rugged, 0 = flat
        const ridge = 1 - Math.abs(c.pv);
        const mountains = smoothstep(-0.15, 0.55, c.continent) * relief * ridge * ridge;
        let raw = spline(c.continent)
            + mountains * 0.78 * R
            + this.noise.fbm((x * 0.012) / H_SCALE, (z * 0.012) / H_SCALE, 4) * (2 + 6 * relief) * V_SCALE
            + this.noise.fbm((x * 0.035) / H_SCALE, (z * 0.035) / H_SCALE, 3) * (0.6 + 1.4 * relief) * V_SCALE;

        const bed = SEA_LEVEL - 3;
        if (c.continent > -0.1 && raw > bed) {
            const rx = x / H_SCALE, rz = z / H_SCALE;
            const r = Math.abs(this.river.noise(
                rx * 0.0035 + this.riverWarp.fbm(rx * 0.006, rz * 0.006, 2) * 1.4, rz * 0.0035
            ));
            if (r < 0.12) {
                const v = r / 0.12;
                raw = bed + (raw - bed) * v * v * (3 - 2 * v);
            }
        }

        // camera visibility clearance "ramp"
        const height = Math.max(2, Math.min(TOP, Math.floor(smin(raw, TOP, 12))));

        return { height, climate: c, biome: pickBiome(c) };
    }

    fill(ch: Chunk) {
        const zMin = -DEPTH * CHUNK_SIZE;
        for (let lz = -1; lz <= CHUNK_SIZE; lz++) for (let lx = -1; lx <= CHUNK_SIZE; lx++) {
            const wx = ch.chunkX * CHUNK_SIZE + lx;
            const wz = ch.chunkZ * CHUNK_SIZE + lz;

            if (wz >= 0 || wz < zMin) continue;

            const { height, climate, biome } = this.column(wx, wz);
            const inner = lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE;

            ch.top[(lx + 1) * PADDING + lz + 1] = height;
            if (inner) {
                const ci = (lz * CHUNK_SIZE + lx) * 2;
                ch.climate[ci] = (climate.temperature + 1) * 127.5;
                ch.climate[ci + 1] = (climate.humidity + 1) * 127.5;
            }

            const patch = this.noise.noise(wx * 0.07 + 31, wz * 0.07);
            let rule: SurfaceRule = biome.surface;
            if (height <= SEA_LEVEL + 1) {      // shores, sea floor any biome
                const bed = height < SEA_LEVEL - 1 && patch > 0.2 ? BLOCK.GRAVEL : BLOCK.SAND;
                rule = (d) => d < 2 ? bed : d < 4 ? (bed === BLOCK.SAND ? BLOCK.SANDSTONE : bed) : BLOCK.STONE;
            } else if (height > ALPINE) {           // alpine
                rule = climate.temperature < 0.4 ? snowy : rocky;
            }

            const base = ch.col(lx, lz)
            const D = Math.min(height, 7);

            for (let d = 0; d <= D; d++) {
                ch.blocks[base + height - d] = rule(d, height - d, patch);
            }

            if (height > D) ch.blocks.fill(BLOCK.STONE, base, base + height - D);
            if (height < SEA_LEVEL) ch.blocks.fill(BLOCK.WATER, base + height + 1, base + SEA_LEVEL + 1);
            ch.maxY = Math.max(ch.maxY, height, height < SEA_LEVEL ? SEA_LEVEL : 0);

            if (inner && height > SEA_LEVEL + 1 && SOIL.has(rule(0, height, patch))) {
                let r = splitmix32(wx, 7, wz);
                const k = 0.4 + 1.2 * Math.min(1, Math.max(0, (patch + 0.2) / 0.7));

                for (const [block, chance] of biome.plants) {
                    if (r < chance * k) {
                        ch.set(lx, height + 1, lz, block);
                        break;
                    }
                    r -= chance * k;
                }
            }
        }
    }
}
