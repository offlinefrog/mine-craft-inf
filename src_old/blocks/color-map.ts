import { Tint, type RGB } from "./registry";

const lin = (v: number) => Math.pow(v / 255, 2.2);

export const hex = (n: number): RGB => [
    lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)
];
export const WATER_TINT = hex(0x3f76e4);

// vanilla colormap corners as default
const GRASS_TRI = [hex(0x80b497), hex(0xbfb755), hex(0x59c93c)];
const FOLIAGE_TRI = [hex(0x60a17b), hex(0xaea42a), hex(0x48b518)];

// continuous biome tints, blended smoothly across borders
export class Colormap {
    private grassImg?: ImageData;
    private foliageImg?: ImageData;

    readonly fixed: Record<number, RGB> = {
        [Tint.BIRCH]: hex(0x80a755),
        [Tint.SPRUCE]: hex(0x619961)
    };

    set(grass?: ImageData, foliage?: ImageData) {
        this.grassImg = grass;
        this.foliageImg = foliage;
    }

    grass(t: number, h: number) {
        return this.sample(this.grassImg, GRASS_TRI, t, h);
    }

    foliage(t: number, h: number) {
        return this.sample(this.foliageImg, FOLIAGE_TRI, t, h);
    }

    private sample(img: ImageData | undefined, tri: RGB[], t: number, h: number): RGB {
        const hh = h * t;

        if (img) {
            const x = Math.floor((1 - t) * (img.width - 1)), y = Math.floor((1 - hh) * (img.height - 1));
            const i = (y * img.width + x) * 4;
            return [lin(img.data[i]), lin(img.data[i + 1]), lin(img.data[i + 2])];
        }

        return [0, 1, 2].map((k) => tri[0][k] * (1 - t) + tri[1][k] * (t - hh) + tri[2][k] * hh) as RGB;
    }
}

export const colormap = new Colormap();
