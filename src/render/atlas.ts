// a texture atlas for all block textures

import * as THREE from "three";

import type { AtlasSlot, BlockRegistry } from "../world/registry";

export class TextureAtlas {
    texture!: THREE.CanvasTexture;
    private registry: BlockRegistry;

    rebuild?: () => void;

    constructor(registry: BlockRegistry) {
        this.registry = registry;
        this.build(new Map());
    }

    build(images: Map<string, ImageBitmap>) {
        let T = 16; // single texture (slot) size
        // consider normalizing textures or using config setting
        for (const im of images.values()) {
            T = Math.max(T, Math.min(128, Math.min(im.width, im.height)));
        }

        const cols = this.registry.cols;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = cols * T;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;

        this.registry.slots.forEach((slot, i) => {
            const x = (i % cols) * T; // pixel coords
            const y = Math.floor(i / cols) * T;

            const im = images.get(slot.name);
            if (im) {
                const s = Math.min(im.width, im.height);
                ctx.drawImage(im, 0, 0, s, s, x, y, T, T);
            } else {
                this.drawFallback(ctx, slot, i, x, y, T);
            }
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        this.texture?.dispose();
        this.texture = texture;
        this.rebuild?.();
    }

    // draws the fallback texture (color) when no texture is found
    private drawFallback(
        ctx: CanvasRenderingContext2D, s: AtlasSlot, slot: number,
        x: number, y: number, T: number
    ) {
        const base = s.neutral ? [0.82, 0.82, 0.82] : s.color;
        const px = T / 16;

        for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
            const v = 0.9 + 0.2 * splitmix32(slot * 31 + i, j, slot);
            const c = base.map((b) => Math.round(Math.min(1, b * v) * 255));

            ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
            ctx.fillRect(x + Math.round(i * px), y + Math.round(j * px), Math.ceil(px), Math.ceil(px));
        }
    }
}
