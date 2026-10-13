import { unzipSync } from "fflate";

const BLOCK_DIR = "assets/minecraft/textures/block/";
const COLORMAP_DIR = "assets/minecraft/textures/colormap/";
const COLORMAP_SIZE = 256;

async function read(
    packs: readonly Blob[], paths: readonly string[]
): Promise<Map<string, Uint8Array>> {
    const found = new Map<string, Uint8Array>();
    for (const pack of packs) {
        const wanted = new Set(paths.filter((p) => !found.has(p)));
        if (wanted.size === 0) break;
        const files = unzipSync(new Uint8Array(await pack.arrayBuffer()), {
            filter: (file) => wanted.has(file.name)
        });
        for (const [path, bytes] of Object.entries(files)) found.set(path, bytes);
    }
    return found;
}

const decode = (bytes: Uint8Array): Promise<ImageBitmap> =>
    createImageBitmap(new Blob([new Uint8Array(bytes)], { type: "image/png" }), {
        premultiplyAlpha: "none", colorSpaceConversion: "none"
    });

export async function loadPackImages(
    packs: readonly Blob[], textures: readonly string[]
): Promise<Map<string, ImageBitmap>> {
    const name = new Map(textures.map((n) => [`${BLOCK_DIR}${n}.png`, n]));
    const files = await read(packs, [...name.keys()]);
    const images = new Map<string, ImageBitmap>();
    for (const [path, bytes] of files) images.set(name.get(path)!, await decode(bytes));
    return images;
}

export interface ColormapPixels {
    grass: Uint8ClampedArray | null;
    foliage: Uint8ClampedArray | null;
}

export async function loadColorMaps(
    packs: readonly Blob[]
): Promise<ColormapPixels> {
    const files = await read(packs, [`${COLORMAP_DIR}grass.png`, `${COLORMAP_DIR}foliage.png`]);
    const pixels = async (file: string): Promise<Uint8ClampedArray | null> => {
        const bytes = files.get(COLORMAP_DIR + file);
        if (!bytes) return null;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = COLORMAP_SIZE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(await decode(bytes), 0, 0, COLORMAP_SIZE, COLORMAP_SIZE);
        return ctx.getImageData(0, 0, COLORMAP_SIZE, COLORMAP_SIZE).data;
    };
    return { grass: await pixels("grass.png"), foliage: await pixels("foliage.png") };
}
