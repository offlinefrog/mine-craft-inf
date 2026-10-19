// Stream determines existing chunks around View and builds them within a per-frame time budget

import type { Builder } from "../build/build";
import type { Mesh } from "../build/mesh";
import { BEHIND_DISTANCE, BUILD_BUDGET_MS, CHUNK_SIZE, LOOKAHEAD, REFRESH_STEP, SIDE_MARGIN, UNLOAD_MARGIN, WORLD_DEPTH } from "../config";
import type { View } from "../render/observer";

export const EntryState = { Pending: 0, Ready: 1, Unloaded: 2 } as const;
export type EntryState = typeof EntryState[keyof typeof EntryState];

export interface Entry {
    readonly cx: number;
    readonly cz: number;
    state: EntryState;
    priority: number; // squared distance to build focus: closer builds first
}

export interface StreamListener {
    ready(entry: Entry, mesh: Mesh | null): void;
    unload(entry: Entry): void;
}

// +/- 1M chunks per axis; key at most 2^42
const KEY_OFFSET = 2 ** 20;
const KEY_SPAN = 2 ** 21;
const key = (cx: number, cz: number): number => (cx + KEY_OFFSET) * KEY_SPAN + (cz + KEY_OFFSET);

const MAX_ROWS = Math.ceil((WORLD_DEPTH + BEHIND_DISTANCE + 2 * (REFRESH_STEP + UNLOAD_MARGIN)) / CHUNK_SIZE) + 2;

// for each chunk row (z), inclusive range of chunk columns (x) visible to camera frustrum, padded
class Rows {
    czMin = 0;
    count = 0;
    readonly lo = new Int32Array(MAX_ROWS);
    readonly hi = new Int32Array(MAX_ROWS);

    fill(view: View, tanHalf: number, pad: number) {
        const zLo = view.z - (WORLD_DEPTH + pad); // camera looks towards -Z
        const zHi = view.z + (BEHIND_DISTANCE + pad);
        this.czMin = Math.floor(zLo / CHUNK_SIZE);
        this.count = Math.floor(zHi / CHUNK_SIZE) - this.czMin + 1;

        for (let i = 0; i < this.count; i++) {
            const farDepth = view.z - (this.czMin + i) * CHUNK_SIZE; // depth of row's far edge
            const half = Math.max(farDepth, 0) * tanHalf + SIDE_MARGIN + pad;
            
            this.lo[i] = Math.ceil((view.x - half) / CHUNK_SIZE) - 1;
            this.hi[i] = Math.floor((view.x + half + LOOKAHEAD) / CHUNK_SIZE); // camera moves towards +X
        }
    }

    contains(cx: number, cz: number): boolean {
        const i = cz - this.czMin;
        return i >= 0 && i < this.count && cx >= this.lo[i] && cx <= this.hi[i];
    }
}

export class Stream {
    private readonly chunks = new Map<number, Entry>();

    private pending: Entry[] = [];               // sorted to pop last chunk as next build
    private readonly failed = new Set<number>(); // chunk build threw
    private readonly load = new Rows();          // existing chunks
    private readonly keep = new Rows();          // retained chunks (larger: hysteresis)

    private x = NaN; // view at last refresh: default NaN forces first
    private z = NaN;
    private fov = NaN;
    private aspect = NaN;
    private started = false;
    private disposed = false;

    private readonly builder: Builder;  // generation and mesh: builder.build
    private readonly listener: StreamListener;

    constructor(builder: Builder, listener: StreamListener) {
        this.builder = builder; this.listener = listener;
    }

    get loaded(): number { return this.chunks.size; }
    get queued(): number { return this.pending.length; }

    entry(cx: number, cz: number): Entry | undefined {
        return this.chunks.get(key(cx, cz));
    }

    // called once per frame. replans when view moved enough then builds for up to budgetMS
    update(view: View, budgetMS = BUILD_BUDGET_MS) {
        if (this.disposed) return;
        
        const still =
            Math.abs(view.x - this.x) < REFRESH_STEP &&
            Math.abs(view.z - this.z) < REFRESH_STEP &&
            view.fov === this.fov &&
            view.aspect === this.aspect;
        if (!still) {
            this.x = view.x; this.z = view.z;
            this.fov = view.fov; this.aspect = view.aspect;

            this.refresh(view);
        }
        this.build(budgetMS);
    }

    // true when first plan exists and no chunk within radius of view is waiting
    primed(view: View, radius: number): boolean {
        if (!this.started) return false;

        const r2 = radius * radius;
        for (const e of this.pending) if (distance2(e, view.x, view.z) <= r2) return false;

        return true;
    }

    reset() {
        this.clear();
        this.failed.clear();
    }

    dispose() {
        this.disposed = true;
        this.clear();
    }

    private clear() {
        for (const e of this.chunks.values()) this.remove(e);
        this.pending = [];
        this.x = NaN;
        this.started = false;
    }

    private refresh(view: View) {
        this.started = true;

        const tanHalf = Math.tan((view.fov * Math.PI) / 360) * view.aspect; // horizontal half-angle tangent
        this.load.fill(view, tanHalf, REFRESH_STEP);
        this.keep.fill(view, tanHalf, REFRESH_STEP + UNLOAD_MARGIN);
        
        // built chunks retained until out of larger keep area, waiting chunks out of load area dropped
        for (const e of this.chunks.values()) {
            const area = e.state === EntryState.Pending ? this.load : this.keep;
            if (!area.contains(e.cx, e.cz)) this.remove(e);
        }

        const { czMin, count, lo, hi } = this.load;
        for (let i = 0; i < count; i++) {
            const cz = czMin + i;
            for (let cx = lo[i]; cx <= hi[i]; cx++) {
                const k = key(cx, cz);
                if (this.chunks.has(k) || this.failed.has(k)) continue;

                this.chunks.set(k, { cx, cz, state: EntryState.Pending, priority: 0 });
            }
        }

        // nearest first, measured from point ahead of camera
        const focusX = view.x + LOOKAHEAD / 2;
        this.pending = [];
        for (const e of this.chunks.values()) {
            if (e.state !== EntryState.Pending) continue;
            e.priority = distance2(e, focusX, view.z);
            this.pending.push(e);
        }
        this.pending.sort((a, b) => b.priority - a.priority);
    }

    // builds at least one chunk per call, then until budgetMS
    private build(budgetMS: number) {
        const deadline = performance.now() + budgetMS;
        do {
            const e = this.pending.pop();
            if (!e) return;
            
            let mesh: Mesh | null;
            try {
                mesh = this.builder.build(e.cx, e.cz);
            } catch (err) {
                console.error(`build(${e.cx},${e.cz}) failed`, err);
                this.failed.add(key(e.cx, e.cz));
                this.remove(e);
                continue;
            }

            e.state = EntryState.Ready;
            this.listener.ready(e, mesh);
        } while (performance.now() < deadline);
    }

    private remove(e: Entry) {
        const wasReady = e.state === EntryState.Ready;
        e.state = EntryState.Unloaded;
        this.chunks.delete(key(e.cx, e.cz));
        if (wasReady) this.listener.unload(e);
    }
}

const distance2 = (e: Entry, x: number, z: number): number => {
    const dx = (e.cx + 0.5) * CHUNK_SIZE - x;
    const dz = (e.cz + 0.5) * CHUNK_SIZE - z;
    return dx * dx + dz * dz;
}
