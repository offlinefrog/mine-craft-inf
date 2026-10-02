import { AHEAD, APPLY_MS, BEHIND, CHUNK_SIZE, DEPTH, WORKERS } from "../config";

import type { ChunkMeshes } from "../meshing/chunk-meshing";

import type { ChunkRenderer } from "../rendering/chunk-rendering";

const key = (cx: number, cz: number) => `${cx},${cz}`;
const PER_WORKER = 2;

interface Result { cx: number, cz: number; parts: ChunkMeshes }

export class ChunkStreamer {
    private renderer: ChunkRenderer;
    private workers: Worker[] = [];
    private inflight: number[] = [];
    private active = new Set<string>();
    private queue: [number, number, number][] = [];
    private results: Result[]= [];
    private ccx = NaN;

    constructor(renderer: ChunkRenderer) {
        this.renderer = renderer;
        for (let i = 0; i < WORKERS; i++) {
            const w = new Worker(new URL('../worker/chunk.worker.ts', import.meta.url), {
                type: 'module', name: location.search
            });
            
            this.inflight.push(0);
            
            w.onmessage = (e: MessageEvent<Result>) => {
                this.inflight[i]--;
                this.results.push(e.data);
                this.dispatch();
            };

            this.workers.push(w);
        }
    }

    queued() {
        return this.queue.length;
    }

    setColormap(grass?: ImageData, foliage?: ImageData) {
        for (const w of this.workers) w.postMessage({
            type: 'colormap', grass, foliage
        });
        
        this.active.clear();
        this.rebuild();
    }

    update(camX: number) {
        const ccx = Math.floor(camX / CHUNK_SIZE);
        if (ccx !== this.ccx) {
            this.ccx = ccx;
            this.rebuild();
        }

        const t0 = performance.now();
        while (this.results.length && performance.now() - t0 < APPLY_MS) {
            const r = this.results.shift()!;
            const k = key(r.cx, r.cz);

            if (!this.active.has(k)) continue;

            this.renderer.remove(k);
            this.renderer.add(k, r.cx, r.cz, r.parts);
        }
    }

    private rebuild() {
        const lo = this.ccx - BEHIND;
        const hi = this.ccx + AHEAD;

        const outside = (k: string) => {
            const cx = Number(k.split(',')[0]);
            return cx < lo || cx > hi;
        }

        for (const k of [...this.renderer.keys()]) {
            if (outside(k)) this.renderer.remove(k);
        }

        for (const k of [...this.active]) {
            if (outside(k)) this.active.delete(k);
        }

        this.queue = [];
        for (let cx = lo; cx <= hi; cx++) for (let cz = -DEPTH; cz <= -1; cz++) {
            if (!this.active.has(key(cx, cz))) {
                this.queue.push([(cx - this.ccx) ** 2 + (cz + 1) ** 2, cx, cz]);
            }
        }

        this.queue.sort((a, b) => b[0] - a[0]);
        this.dispatch();
    }

    private dispatch() {
        while (this.queue.length) {
            let w = 0;
            for (let i = 1; i < this.workers.length; i++) {
                if (this.inflight[i] < this.inflight[w]) w = i;
            }

            if (this.inflight[w] >= PER_WORKER) return;

            const [_, cx, cz] = this.queue.pop()!;
            this.active.add(key(cx, cz));
            this.inflight[w]++;
            this.workers[w].postMessage({ cx, cz });
        }
    }
}
