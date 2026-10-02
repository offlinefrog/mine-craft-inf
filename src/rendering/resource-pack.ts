import { unzipSync } from 'fflate';

export interface Pack {
    blocks: Map<string, ImageBitmap>;
    grass?: ImageData;
    foliage?: ImageData;
}

export async function loadPack(file: File): Promise<Pack> {
    const files = unzipSync(new Uint8Array(await file.arrayBuffer()), {
        filter: (f) => /(^|\/)assets\/minecraft\/textures\/(block\/[^/]+|colormap\/(grass|foliage))\.png$/.test(f.name),
    });

    const pack: Pack = { blocks: new Map() };
    for (const [path, data] of Object.entries(files)) {
        const bmp = await createImageBitmap(new Blob([data.slice()], { type: 'image/png' }));
        const name = path.split('/').pop()!.replace(/\.png$/, '');

        if (path.includes('colormap/')) {
            const ctx = new OffscreenCanvas(bmp.width, bmp.height).getContext('2d')!;
            ctx.drawImage(bmp, 0, 0);
            const img = ctx.getImageData(0, 0, bmp.width, bmp.height);
            if (name === 'grass') pack.grass = img; else pack.foliage = img;
        } else {
            pack.blocks.set(name, bmp);
        }
    }
    return pack;
}
