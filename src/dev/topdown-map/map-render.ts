import { SEA_LEVEL, WORLD_HEIGHT } from "../../config";
import { Chunk } from "../../world/chunk";
import { BIOME_RGB } from "./biome-colors";
import type { Tile } from "./map-tiles";

export type MapMode = "biome" | "height" | "both";

export interface RenderOptions {
    mode: MapMode;
    blend: number;      // "both": weight of height colour over biome colour (0..1)
    hillshade: boolean; // light terrain from north-west (height and both)
}

// blocks above sea level mapping to land ramp top (tune)
const LAND_RANGE = 140;
const SHADE_STRENGTH = 0.06; // brithness change per block of slope

type RGB = readonly [number, number, number];
type Stop = readonly [t: number, rgb: RGB];

const SEA_STOPS: readonly Stop[] = [
    [0, [8, 22, 61]], [0.6, [29, 79, 143]], [1, [91, 181, 214]]
];
const LAND_STOPS: readonly Stop[] = [
    [0, [91, 154, 82]], [0.15, [158, 194, 106]], [0.35, [217, 201, 122]],
    [0.55, [160, 124, 79]], [0.8, [122, 106, 92]], [1, [255, 255, 255]],
];

function ramp(stops: readonly Stop[], t: number): RGB {
    if (t <= stops[0]![0]) return stops[0]![1];
    for (let i = 1; i < stops.length; i++) {
        const [t1, b] = stops[i]!;
        if (t <= t1) {
            const [t0, a] = stops[i - 1]!;
            const f = (t - t0) / (t1 - t0);
            return [
                a[0] + (b[0] - a[0]) * f,
                a[1] + (b[1] - a[1]) * f,
                a[2] + (b[2] - a[2]) * f,
            ];
        }
    }
    return stops[stops.length - 1]![1];
}

// colour per integer height y, 3 bytes each. underwater gets a depth ramp, land an elevation ramp
const HEIGHT_RGB = new Uint8Array((WORLD_HEIGHT + 1) * 3);
for (let y = 0; y <= WORLD_HEIGHT; y++) {
    const [r, g, b] = y < SEA_LEVEL
        ? ramp(SEA_STOPS, y / SEA_LEVEL)
        : ramp(LAND_STOPS, (y - SEA_LEVEL) / LAND_RANGE);
    HEIGHT_RGB.set([r, g, b], y * 3);
}

const clampY = (h: number): number => (h < 0 ? 0 : h > WORLD_HEIGHT ? WORLD_HEIGHT : h);
// water is flat - shaded as if surface at sea level
const shadeY = (h: number): number => Math.max(clampY(h), SEA_LEVEL);

// packed AGBR (little-endian) colour of column (lx, lz) of a tile in 0..15
export function colorAt(tile: Tile, lx: number, lz: number, o: RenderOptions): number {
    const i = Chunk.base(lx, lz);
    const id = tile.biomes[i]!;
    const h = clampY(tile.heights[i]!);

    let r: number, g: number, b: number;
    if (o.mode === "biome") {
        r = BIOME_RGB[id * 3]!, g = BIOME_RGB[id * 3 + 1]!, b = BIOME_RGB[id * 3 + 2]!;
        return 0xff000000 | (b << 16) | (g << 8) | r;
    }

    if (o.mode === "height") {
        r = HEIGHT_RGB[h * 3]!; g = HEIGHT_RGB[h * 3 + 1]!; b = HEIGHT_RGB[h * 3 + 2]!;
    } else {
        const a = o.blend, k = 1 - a;
        r = BIOME_RGB[id * 3]!     * k + HEIGHT_RGB[h * 3]! * a;
        g = BIOME_RGB[id * 3 + 1]! * k + HEIGHT_RGB[h * 3 + 1]! * a;
        b = BIOME_RGB[id * 3 + 2]! * k + HEIGHT_RGB[h * 3 + 2]! * a;
    }

    if (o.hillshade) {
        // neighbors come from padded ring
        const dx = shadeY(tile.heights[Chunk.base(lx + 1, lz)]!) - shadeY(tile.heights[Chunk.base(lx - 1, lz)]!);
        const dz = shadeY(tile.heights[Chunk.base(lx, lz + 1)]!) - shadeY(tile.heights[Chunk.base(lx, lz - 1)]!);
        // light form north-west (x east, z south): ground rising towards south-east is lit
        const s = Math.max(0.55, Math.min(1.45, 1 + SHADE_STRENGTH * (dx + dz) * 0.5));
        r *= s; g *= s; b *= s;
    }

    r = r > 255 ? 255 : r; g = g > 255 ? 255 : g; b = b > 255 ? 255 : b;
    return 0xff000000 | (b << 16) | (g << 8) | r;
}

// paints pixels covered by one chunk: ci/cj are chunk's column/row relative to view origin
// scale is screen pixels per block: pixel p shows block floor (p / scale)
// returns painted pixel rectangle [x0, y0, x1, y1) clamped to canvas or null if off-screen
export function paintChunk(
    px32: Uint32Array, width: number, height: number,
    tile: Tile, ci: number, cj: number, scale: number, o: RenderOptions,
): [number, number, number, number] | null {
    const x0 = Math.max(0, Math.ceil(ci * 16 * scale)), x1 = Math.min(width, Math.ceil((ci + 1) * 16 * scale));
    const y0 = Math.max(0, Math.ceil(cj * 16 * scale)), y1 = Math.min(height, Math.ceil((cj + 1) * 16 * scale));
    if (x0 >= x1 || y0 >= y1) return null;

    for (let py = y0; py < y1; py++) {
        const lz = Math.min(15, Math.max(0, Math.floor(py / scale) - cj * 16));
        const row = py * width;
        for (let px = x0; px < x1; px++) {
            const lx = Math.min(15, Math.max(0, Math.floor(px / scale) - ci * 16));
            px32[row + px] = colorAt(tile, lx, lz, o);
        }
    }
    return [x0, y0, x1, y1];
}
