// Stream asynchronously generates Mesh for its StreamListener based on changes to the View

import type { Mesh } from "../build/mesh";
import { BEHIND_DISTANCE, CHUNK_SIZE, LOOKAHEAD, MAX_INFLIGHT, REFRESH_STEP, SIDE_MARGIN, UNLOAD_MARGIN, WORLD_DEPTH } from "../config";

export interface View {
    x: number;
    z: number;
    fov: number;
    aspect: number;
}

export const State = {
    Pending: 0,
    Building: 1,
    Ready: 2,
    Unloaded: 3
} as const;
export type State = typeof State[keyof typeof State];

export interface Entry {
    readonly cx: number;
    readonly cz: number;
    state: State;
    priority: number;
}

const KEY_OFFSET = 0x8000;
const KEY_SPAN = 0x10000;
const key = (cx: number, cz: number): number =>
    (cx + KEY_OFFSET) * KEY_SPAN + (cz + KEY_OFFSET);

export interface StreamListener {
    ready(entry: Entry, mesh: Mesh | null): void;
    unload(entry: Entry): void;
}

const MAX_ROWS = Math.ceil((WORLD_DEPTH + BEHIND_DISTANCE + 2 * (REFRESH_STEP + UNLOAD_MARGIN)) / CHUNK_SIZE) + 2;

class Rows {
    czMin = 0;
    count = 0;
    readonly lo = new Int32Array(MAX_ROWS);
    readonly hi = new Int32Array(MAX_ROWS);

    fill(view: View, tanHalf: number, pad: number) {
        const ahead = WORLD_DEPTH + pad;
        const behind = BEHIND_DISTANCE + pad;
        const side = SIDE_MARGIN + pad;

        const zLo = view.z - ahead;
        const zHi = view.z + behind;
        this.czMin = Math.floor(zLo / CHUNK_SIZE);
        this.count = Math.floor(zHi / CHUNK_SIZE) - this.czMin + 1;

        for (let i = 0; i < this.count; i++) {
            const cz = this.czMin + i;
            const farDepth = view.z - cz * CHUNK_SIZE;
            const half = Math.max(farDepth, 0) * tanHalf + side;
            this.lo[i] = Math.ceil((view.x - half) / CHUNK_SIZE) - 1;
            this.hi[i] = Math.floor((view.x + half + LOOKAHEAD) / CHUNK_SIZE);
        }
    }

    contains(cx: number, cz: number): boolean {
        const i = cz - this.czMin;
        return i >= 0 && i < this.count && cx >= this.lo[i] && cx <= this.hi[i];
    }
}

export class Stream {
    private readonly chunks = new Map<number, Entry>();
    private readonly pending: Entry[] = [];

    private readonly load = new Rows();
    private readonly keep = new Rows();

    private inflight = 0;
    private disposed = false;

    private x = Infinity;
    private z = Infinity;
    private fov = NaN;
    private aspect = NaN;

    private readonly builder: Builder;  // generation and mesh: builder.build
    private readonly listener: StreamListener;

    constructor(builder: Builder, listener: StreamListener) {
        this.builder = builder; this.listener = listener;
    }

    get loaded(): number { return this.chunks.size }

    entry(cx: number, cz: number): Entry | undefined {
        return this.chunks.get(key(cx, cz));
    }

    update(view: View) {
        if (this.disposed) return;
        
        const moved =
            Math.abs(view.x - this.x) >= REFRESH_STEP ||
            Math.abs(view.z - this.z) >= REFRESH_STEP ||
            view.fov !== this.fov ||
            view.aspect !== this.aspect;
        if (!moved) return;

        this.x = view.x;
        this.z = view.z;
        this.fov = view.fov;
        this.aspect = view.aspect;

        this.refresh(view);
        this.pump();
    }

    primed(view: View, radius: number): boolean {
        const r2 = radius * radius;
        for (const e of this.chunks.values()) {
            if (e.state !== State.Ready && distance2(e, view.x, view.z) <= r2) return false;
        }
        return true;
    }

    dispose() {
        this.disposed = true;
        this.pending.length = 0;
        for (const e of this.chunks.values()) this.remove(e);
    }

    private refresh(view: View) {
        const tanHalf = Math.tan((view.fov * Math.PI) / 360) * view.aspect;
        this.load.fill(view, tanHalf, REFRESH_STEP);
        this.keep.fill(view, tanHalf, REFRESH_STEP + UNLOAD_MARGIN);

        for (const e of this.chunks.values()) {
            if (!this.keep.contains(e.cx, e.cz)) this.remove(e);
        }

        const { czMin, count, lo, hi } = this.load;
        for (let i = 0; i < count; i++) {
            const cz = czMin + i;
            for (let cx = lo[i]; cx <= hi[i]; cx++) {
                const k = key(cx, cz);
                if (this.chunks.has(k)) continue;

                const entry: Entry = { cx, cz, state: State.Pending, priority: 0 };
                this.chunks.set(k, entry);
                this.pending.push(entry);
            }
        }

        let w = 0;
        for (const e of this.pending) {
            if (e.state !== State.Pending) continue;
            e.priority = distance2(e, view.x, view.z);
            this.pending[w++] = e;
        }
        this.pending.length = w;
        this.pending.sort((a, b) => b.priority - a.priority);
    }

    private remove(e: Entry) {
        const ready = e.state === State.Ready;
        e.state = State.Unloaded;
        this.chunks.delete(key(e.cx, e.cz));
        if (ready) this.listener.unload(e);
    }

    private pump() {
        while (!this.disposed && this.inflight < MAX_INFLIGHT) {
            const entry = this.pending.pop();
            if (!entry) return;
            if (entry.state !== State.Pending) continue;
            void this.run(entry);
        }
    }

    private async run(entry: Entry): Promise<void> {
        entry.state = State.Building;
        this.inflight++;
        try {
            const mesh = await this.builder.build(entry.cx, entry.cz);
            if (unloaded(entry)) return;
            entry.state = State.Ready;
            this.listener.ready(entry, mesh);
        } catch (e) {
            if (!unloaded(entry)) {
                console.error(`build(${entry.cx},${entry.cz}) failed`, e);
                this.remove(entry);
            }
        } finally {
            this.inflight--;
            this.pump();
        }
    }
}

const distance2 = (e: Entry, x: number, z: number): number => {
    const dx = (e.cx + 0.5) * CHUNK_SIZE - x;
    const dz = (e.cz + 0.5) * CHUNK_SIZE - z;
    return dx * dx + dz * dz;
}

const unloaded = (e: Entry): boolean => e.state === State.Unloaded;

