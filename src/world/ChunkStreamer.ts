import { AHEAD, BEHIND, CS, DEPTH, GEN_BUDGET } from '../config';
import { WorldGenerator } from '../generation/WorldGenerator';
import { ChunkRenderer } from '../rendering/ChunkRenderer';
import { World } from './world';

export class ChunkStreamer {
    private world: World;
    private gen: WorldGenerator;
    private renderer: ChunkRenderer;

    constructor(world: World, gen: WorldGenerator, renderer: ChunkRenderer) {
        this.world = world;
        this.gen = gen;
        this.renderer = renderer;
    }

    update(camX: number, genBudget = GEN_BUDGET) {
        const ccx = Math.floor(camX / CS), lo = ccx - BEHIND, hi = ccx + AHEAD;
        const prio = (cx: number, cz: number) => (cx - ccx) ** 2 + (cz + 1) ** 2;

        const need: [number, number, number][] = [];
        for (let cx = lo - 1; cx <= hi + 1; cx++) for (let cz = -DEPTH; cz <= -1; cz++) {
            if (!this.world.get(cx, cz)) need.push([prio(cx, cz), cx, cz]);
        }
        need.sort((a, b) => a[0] - b[0]);
        for (const [, cx, cz] of need.slice(0, genBudget)) {
            this.world.add(this.gen.generate(cx, cz));
        }

        const todo: [number, number, number][] =[];
        for (let cx = lo; cx <= hi; cx++) for (let cz = -DEPTH; cz <= -1; cz++) {
            const ch = this.world.get(cx, cz);
            if (!ch || ch.meshed) continue;
            
            const ok = this.world.get(cx - 1, cz) && this.world.get(cx + 1, cz) &&
                (cz === -DEPTH || this.world.get(cx, cz - 1)) && (cz === -1 || this.world.get(cx, cz+ 1));
            if (ok) todo.push([prio(cx, cz), cx, cz]);
        }

        for (const ch of [...this.world.chunks.values()]) {
            if (ch.cx < lo - 1 || ch.cx > hi + 1) {
                this.renderer.remove(ch);
                this.world.remove(ch);
            }
        }
    }
}