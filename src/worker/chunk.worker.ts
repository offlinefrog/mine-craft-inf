import { SEED } from "../config";

import { colormap } from "../blocks/color-map";

import { TerrainGenerator } from "../generation/terrain-generation";
import { WorldGenerator } from "../generation/world-generation";

import { meshChunk } from "../meshing/chunk-meshing";

import { Chunk } from "../world/chunk";

const gen = new WorldGenerator(new TerrainGenerator(SEED), SEED);
const scratch = new Chunk();

self.onmessage = (e: MessageEvent) => {
    const m = e.data;
    if (m.type === 'colormap') {
        colormap.set(m.grass, m.foliage);
        return;
    }

    gen.generate(scratch, m.cx, m.cz);
    const parts = meshChunk(scratch);
    const transfer: Transferable[] = [];

    for (const p of parts) {
        if (p) transfer.push(p.pos.buffer, p.col.buffer, p.uv.buffer, p.idx.buffer);
    }

    self.postMessage({ cx: m.cx, cz: m.cz, parts }, { transfer });
}
