import { CS, HEIGHT, SEA } from '../config';
import { B } from '../lib/blocks';
import { Chunk } from '../world/Chunk';
import { Simplex } from '../lib/noise';
import { BiomeMap } from './biome';

export class TerrainGenerator {
    private noise: Simplex;
    private biomes: BiomeMap;

    constructor(seed: number) {
        this.noise = new Simplex(seed);
        this.biomes = new BiomeMap(seed);
    }

    column(x: number, z: number) {
        const s = this.biomes.sample(x, z);
        const n = this.noise.fbm(x * 0.012, z * 0.012, 4);
        const height = Math.max(2, Math.min(HEIGHT - 14, Math.floor(s.base + n * s.amp * 1.5)));

        return { h: height, b: s.biome };
    }

    fill(ch: Chunk) {
        for (let lz = 0; lz < CS; lz ++) for (let lx = 0; lx < CS; lx++) {
            const { h, b } = this.column(ch.cx * CS + lx, ch.cz * CS + lz);
            const surf = h <= SEA + 1 ? B.SAND : h > 78 ? B.SNOW : b.surface;
            const sub = surf === B.SAND ? B.SAND : b.sub;

            for (let y = 0; y <= h; y++) {
                ch.set(lx, y, lz, h - y === 0 ? surf : h - y < 4 ? sub : B.STONE);
            }
            for (let y = h + 1; y <= SEA; y++) {
                ch.set(lx, y, lz, B.WATER);
            }
        }
    }
}
