// biome-based block tint colors based on https://minecraft.wiki/w/Biome#Tint

import { Tint } from "./blocks";

const COLORMAP_SIZE = 256;

type RGB = readonly [number, number, number];

interface Corners {
    wet: RGB;   // top-left:     temperature = 1.0, downfall = 1.0
    arid: RGB;  // bottom-left:  temperature = 1.0, downfall = 0.0
    cold: RGB;  // bottom-right: temperature = 0.0, downfall = 0.0
}

// default approx. vanilla colormap corners
const GRASS: Corners = { wet: [71, 205, 51],   arid: [191, 183, 85], cold: [128, 180, 151] };
const FOLIAGE: Corners = { wet: [72, 181, 24], arid: [174, 164, 42], cold: [96, 161, 123] };

const FIXED: Partial<Record<Tint, RGB>> = {
    [Tint.BIRCH]:  [0x80, 0xa7, 0x55],
    [Tint.SPRUCE]: [0x61, 0x99, 0x61],
    [Tint.WATER]:  [0x3f, 0x76, 0xe4],
};

const bind = (v: number): number => Math.max(0, Math.min(1, v));

function sample(map: ArrayLike<number> | null, corners: Corners, temperature: number, downfall: number, out: number[]) {
    const t = bind(temperature);
    const x = 1 - t;
    const y = 1 - bind(downfall) * t;
    if (map) {
        const i = Math.floor(x * (COLORMAP_SIZE - 1));
        const j = Math.floor(y * (COLORMAP_SIZE - 1));
        const o = (j * COLORMAP_SIZE + i) * 4;
        out[0] = map[o]; out[1] = map[o + 1]; out[2] = map[o + 2];
        return;
    }

    const wB = 1 - y, wA = y - x, wC = x;
    for (let k = 0; k < 3; k++) {
        out[k] = Math.round(wB * corners.wet[k] + wA * corners.arid[k] + wC * corners.cold[k]);
    }
}

export class Colormap {
    private grass: ArrayLike<number> | null = null;
    private foliage: ArrayLike<number> | null = null;

    set(grass: ArrayLike<number> | null, foliage: ArrayLike<number> | null) {
        const size = COLORMAP_SIZE * COLORMAP_SIZE * 4;
        if ((grass && grass.length !== size) || (foliage && foliage.length !== size)) {
            throw new Error(`colormaps must be ${COLORMAP_SIZE}x${COLORMAP_SIZE} RGBA`);
        }
        this.grass = grass;
        this.foliage = foliage;
    }

    color(tint: Tint, temperature: number, downfall: number, out: number[]) {
        if (tint === Tint.GRASS) return sample(this.grass, GRASS, temperature, downfall, out);
        if (tint === Tint.FOLIAGE) return sample(this.foliage, FOLIAGE, temperature, downfall, out);
        const fixed = FIXED[tint];

        out[0] = fixed ? fixed[0] : 255;
        out[1] = fixed ? fixed[1] : 255;
        out[2] = fixed ? fixed[2] : 255;
    }
}
