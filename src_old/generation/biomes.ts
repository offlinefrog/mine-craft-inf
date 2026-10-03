import { lvl } from '../config';

import { BLOCK } from '../blocks/block';

import type { Climate } from './climate';
import { birch, cactus, oak, spruce, type StructureDef } from './structures';

/** block at depth below the surface = 0, height y, and low-freq noise patch in [-1, 1] */
export type SurfaceRule = (depth: number, y: number, patch: number) => number;

const grassy: SurfaceRule = (d) =>
    d === 0 ? BLOCK.GRASS_BLOCK : d < 4 ? BLOCK.DIRT : BLOCK.STONE;
const podzolic: SurfaceRule = (d, _y, p) =>
    d === 0 ? (p > 0.15 ? BLOCK.PODZOL : BLOCK.GRASS_BLOCK) : d < 4 ? BLOCK.DIRT : BLOCK.STONE;
const sandy: SurfaceRule = (d) =>
    d < 2 ? BLOCK.SAND : d < 4 ? BLOCK.SANDSTONE : BLOCK.STONE;

export const snowy: SurfaceRule = (d) =>
    d === 0 ? BLOCK.SNOW_BLOCK : d < 4 ? BLOCK.DIRT : BLOCK.STONE;
export const rocky: SurfaceRule = () => BLOCK.STONE;

const HILL = lvl(0.74);
const SNOWLINE = lvl(0.59);

const peaks: SurfaceRule = (d, y) =>
    y >= SNOWLINE && d < 3 ? BLOCK.SNOW_BLOCK : BLOCK.STONE;
const hills: SurfaceRule = (d, y, p) =>
    d === 0 ? (y > HILL || p > 0.3 ? BLOCK.STONE : BLOCK.GRASS_BLOCK) : d < 4 && y <= HILL ? BLOCK.DIRT : BLOCK.STONE;

const BANDS = [
    BLOCK.TERRACOTTA, BLOCK.ORANGE_TERRACOTTA,
    BLOCK.TERRACOTTA, BLOCK.YELLOW_TERRACOTTA,
    BLOCK.ORANGE_TERRACOTTA, BLOCK.TERRACOTTA,
    BLOCK.TERRACOTTA
];
const mesa: SurfaceRule = (d, y, p) =>
    d < 1 ? BLOCK.RED_SAND : d < 8 ? BANDS[(((y + Math.floor(p * 3)) % 7) + 7) % 7] : BLOCK.STONE;

export interface Biome {
    name: string;
    at: [temp: number, humid: number, cont: number, eros: number];  // center in climate space
    surface: SurfaceRule;
    plants: [block: number, chance: number][];      // ground cover rolle once per column
    features: [StructureDef, chance: number][];     // structures by per-cell spawn chance
}

export const BIOMES: Biome[] = [
    {
        name: 'plains',
        at: [0.1, -0.1, 0.2, 0.3],
        surface: grassy,
        plants: [[BLOCK.SHORT_GRASS, 0.25], [BLOCK.DANDELION, 0.02], [BLOCK.POPPY, 0.02]],
        features: [[oak, 0.05]]
    },
    {
        name: 'forest',
        at: [0.0, 0.5, 0.2, 0.2],
        surface: grassy,
        plants: [[BLOCK.SHORT_GRASS, 0.15], [BLOCK.POPPY, 0.01]],
        features: [[oak, 0.5], [birch, 0.3]]
    },
    {
        name: 'taiga',
        at: [-0.5, 0.4, 0.2, 0.2],
        surface: podzolic,
        plants: [[BLOCK.SHORT_GRASS, 0.1]],
        features: [[spruce, 0.5]]
    },
    {
        name: 'snowy_plains',
        at: [-0.9, -0.2, 0.2, 0.3],
        surface: snowy,
        plants: [],
        features: [[spruce, 0.05]]
    },
    {
        name: 'desert',
        at: [0.9, -0.8, 0.2, 0.4],
        surface: sandy,
        plants: [[BLOCK.DEAD_BUSH, 0.01]],
        features: [[cactus, 0.2]],
    },
    {
        name: 'badlands',
        at: [0.8, -0.3, 0.3, -0.2],
        surface: mesa,
        plants: [[BLOCK.DEAD_BUSH, 0.02]],
        features: [[cactus, 0.08]]
    },
    {
        name: 'windswept_hills',
        at: [-0.1, 0.0, 0.6, -0.6],
        surface: hills,
        plants: [[BLOCK.SHORT_GRASS, 0.1]],
        features: [[spruce, 0.12], [oak, 0.05]]
    },
    {
        name: 'snowy_peaks',
        at: [-0.8, 0.0, 0.6, -0.7],
        surface: peaks,
        plants: [],
        features: []
    },
    {
        name: 'ocean',
        at: [0.0, 0.0, -0.7, 0.0],
        surface: sandy,
        plants: [],
        features: []
    },
];

const W = [1, 1, 1.6, 1]; // parameter weights

/** selects nearest biome center in climate space */
export function pickBiome(c: Climate): Biome {
    let best = BIOMES[0], bd = Infinity;
    for (const b of BIOMES) {
        const d = W[0] * (b.at[0] - c.temperature) ** 2 + W[1] * (b.at[1] - c.humidity) ** 2 +
                  W[2] * (b.at[2] - c.continent) ** 2 + W[3] * (b.at[3] - c.erosion) ** 2;
        
        if (d < bd) {
            bd = d;
            best = b;
        }
    }
    
    return best;
}
