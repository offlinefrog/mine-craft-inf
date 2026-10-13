// a texture atlas for all block textures

import * as THREE from "three";

import type { BlockRegistry } from "../mesh/block-registry";
import { hash } from "../generate/core/hash";

export type PackImage = CanvasImageSource & { width: number; height: number; }

const MIN_TILE = 16; const MAX_TILE = 128;

export class TextureAtlas {
    private current!: THREE.CanvasTexture;
    private readonly listeners: Array<(t: THREE.CanvasTexture) => void> = [];

    private readonly registry: BlockRegistry;

    constructor(registry: BlockRegistry) {
        this.registry = registry;
        this.build();
    }

    get texture(): THREE.CanvasTexture { return this.current; }

    rebuild(fn: (t: THREE.CanvasTexture) => void) { this.listeners.push(fn); }

    build(images: ReadonlyMap<string, PackImage> = new Map()) {
        const { registry } = this;
        const frame = (im: PackImage) => Math.min(im.width, im.height);

        let tile = MIN_TILE;
        // consider normalizing textures or using config setting
        for (const name of registry.slotNames) {
            const im = images.get(name);
            if (im) tile = Math.max(tile, frame(im));
        }
        tile = Math.min(tile, MAX_TILE);

        const cols = registry.columns;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = cols * tile;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;

        registry.slotNames.forEach((name, slot) => {
            const dx = (slot % cols) * tile; // pixel coords
            const dy = Math.floor(slot / cols) * tile;
            const im = images.get(name);

            if (im) {
                const s = frame(im);
                ctx.drawImage(im, 0, 0, s, s, dx, dy, tile, tile);
            } else {
                ctx.drawImage(fallback(registry.slotFallback[slot]), 0, 0, 16, 16, dx, dy, tile, tile);
            }
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.SRGBColorSpace;

        const old = this.current;
        this.current = texture;
        for (const fn of this.listeners) fn(texture);
        old?.dispose();
    }
}

function fallback(color: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 16;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(16, 16);
    
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const i = (y * 16 + x) * 4;
        const k = 0.88 + 0.24 * (hash(color, x, y) / 0x100000000);

        img.data[i] = Math.min(255, r * k);
        img.data[i + 1] = Math.min(255, g * k);
        img.data[i + 2] = Math.min(255, b * k);
        img.data[i + 3] = 255;
    }

    ctx.putImageData(img, 0, 0);
    return canvas;
}
