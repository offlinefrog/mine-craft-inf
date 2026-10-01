import { B } from '../lib/blocks';
import { Simplex } from '../lib/noise';

export interface Biome {
    name: string;
    t: number;
    h: number;
    base: number;
    amp: number;
    surface: B,
    sub: B,
}

export const BIOMES: Biome[] = [
    { name: 'plains',    t: 0.5,  h: 0.4, base: 32, amp: 6,  surface: B.GRASS, sub: B.DIRT },
    { name: 'forest',    t: 0.45, h: 0.8, base: 34, amp: 9,  surface: B.GRASS, sub: B.DIRT },
    { name: 'desert',    t: 0.9,  h: 0.1, base: 31, amp: 5,  surface: B.SAND,  sub: B.SAND },
    { name: 'tundra',    t: 0.1,  h: 0.5, base: 36, amp: 12, surface: B.SNOW,  sub: B.DIRT },
    { name: 'mountains', t: 0.3,  h: 0.1, base: 50, amp: 36, surface: B.STONE, sub: B.STONE },
]

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export class BiomeMap {
    private temp: Simplex; private humid: Simplex;

    constructor(seed: number) {
        this.temp = new Simplex(seed + 11);
        this.humid = new Simplex(seed + 23);
    }

    sample(x: number, z: number) {
        const t = clamp01(0.5 + this.temp.fbm(x * 0.0025, z * 0.0025, 3) * 1.3);
        const h = clamp01(0.5 + this.humid.fbm(x * 0.0025, z * 0.0025, 3) * 1.3);
        
        let biome = BIOMES[0], best = -1, sw = 0, base = 0, amp = 0;
        for (const b of BIOMES) {
            const w = Math.exp(-((b.t - t) ** 2 + (b.h - h) ** 2) / 0.05);
            sw += w; base += w * b.base; amp += w * b.amp;
            if (w > best) { best = w; biome = b; }
        }
        return { biome, base: base / sw, amp: amp / sw };
    }
}
