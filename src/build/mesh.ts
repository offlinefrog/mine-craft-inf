// Mesher turns a generated Chunk into vertex data for Three.js (one geometry per material layer)

import { CHUNK_SIZE, SEA_LEVEL, WORLD_HEIGHT } from "../config";
import { BLOCK, Layer, Shape, Tint } from "../world/blocks/blocks";
import { Chunk, PADDED_SIZE } from "../world/chunk";

import type { Colormap } from "../world/blocks/colormap";
import type { BlockRegistry } from "../world/blocks/block-registry";
import type { BiomeRegistry } from "../world/biomes/biome-registry";

// positions are Uint16 in 1/VERTEX_SCALE-block units used for liquid drops (2/16) and cross planes (3/16, 13/16)
export const VERTEX_SCALE = 16;
if (VERTEX_SCALE % 16 !== 0 || WORLD_HEIGHT * VERTEX_SCALE > 0xffff)
    throw new Error(`VERTEX_SCALE ${VERTEX_SCALE} must be a multiple of 16 with WORLD_HEIGHT * VERTEX_SCALE <= 65535`);

const Face = { PY: 0, NY: 1, NX: 2, PX: 3, NZ: 4, PZ: 5 } as const;
type Face = (typeof Face)[keyof typeof Face];
const ALL_FACES: readonly Face[] = [Face.PY, Face.NY, Face.NX, Face.PX, Face.NZ, Face.PZ];

// index step to neighboring block by face for chunk layout: ((x + 1) * PADDED_SIZE + (z + 1)) * WORLD_HEIGHT + y
const STEP_X = PADDED_SIZE * WORLD_HEIGHT;
const STEP_Z = WORLD_HEIGHT;
const STEP = [1, -1, -STEP_X, STEP_X, -STEP_Z, STEP_Z] as const;
if (Chunk.column(1, 0) - Chunk.column(0, 0) !== STEP_X || Chunk.column(0, 1) - Chunk.column(0, 0) !== STEP_Z)
    throw new Error("Chunk layout changed: update STEP_X, STEP_Z in mesh.ts");

// unit-cube corners per face, ccw from outside cube
const CORNERS = new Int8Array([
    0, 1, 1,    1, 1, 1,    1, 1, 0,    0, 1, 0, // +Y
    0, 0, 0,    1, 0, 0,    1, 0, 1,    0, 0, 1, // -Y
    0, 0, 0,    0, 0, 1,    0, 1, 1,    0, 1, 0, // -X
    1, 0, 1,    1, 0, 0,    1, 1, 0,    1, 1, 1, // +X
    1, 0, 0,    0, 0, 0,    0, 1, 0,    1, 1, 0, // -Z
    0, 0, 1,    1, 0, 1,    1, 1, 1,    0, 1, 1, // +Z
]);
const UV_U = [0, 1, 1, 0];
const UV_V = [0, 0, 1, 1];

// two diagonal planes, double-sided
const CROSS = [
    [3,  0, 3,   13, 0, 13,   13, 16, 13,   3,  16, 3],
    [13, 0, 3,   3,  0, 13,   3,  16, 13,   13, 16, 3],
];

// vanilla face brightness (sRGB multiplier), applied in linear space
const SHADE = [1.0, 0.5, 0.6, 0.6, 0.8, 0.8].map((b) => Math.pow(b, 2.2));
const LIN = new Float32Array(256).map((_, i) => Math.pow(i / 255, 2.2)); // sRGB byte -> linear

const LIQUID_DROP = 2;       // top-most liquids sit 2/16 below block top
const DROP_UNITS = (LIQUID_DROP * VERTEX_SCALE) / 16;
const GRID = CHUNK_SIZE + 1; // tint sampled at block corners: 17x17
const TINT_SLOTS = 8;

// all quads share index pattern (0,1,2)(0,2,3)
const SHARED_QUADS = 0x4000; // 16384 quads = 65536 vertices
const SHARED_INDEX = new Uint16Array(SHARED_QUADS * 6);
fillQuadIndices(SHARED_INDEX, SHARED_QUADS);

function fillQuadIndices(index: Uint16Array | Uint32Array, quads: number) {
    for (let q = 0, i = 0; q < quads; q++) {
        const b = q * 4;
        index[i++] = b; index[i++] = b + 1; index[i++] = b + 2;
        index[i++] = b; index[i++] = b + 2; index[i++] = b + 3;
    }
}

type TypedArray = Uint8Array | Uint16Array | Uint32Array;

interface MeshAttribute {
    array: TypedArray;
    itemSize: number;
    normalized?: boolean;
}

export interface GeometryData {
    attributes: Record<string, MeshAttribute>;
    index: Uint16Array | Uint32Array;
}

export interface Mesh {
    opaque: GeometryData | null;
    cutout: GeometryData | null;
    translucent: GeometryData | null;
    yMin: number;
    yMax: number;
}

// dynamic quad buffer (4 vertices per quad)
class QuadBuffer {
    private cap = 1024;
    private pos = new Uint16Array(this.cap * 3);
    private uv = new Uint16Array(this.cap * 2);
    private col = new Uint8Array(this.cap * 4);
    private readonly rects: Uint16Array;
    v = 0;

    constructor(rects: Uint16Array) {
        this.rects = rects;
    }

    reset() { this.v = 0; }

    // one cube face. shade: linear brightness. tint: linear rgb per block corner or null. drop: lowers liquid's top
    addFace(
        bx: number, by: number, bz: number, face: Face, slot: number,
        shade: number, tint: Float32Array | null, drop: boolean
    ) {
        this.ensure();
        const r = this.rects;

        const u0 = r[slot * 4];
        const v0 = r[slot * 4 + 1];
        const u1 = r[slot * 4 + 2];
        const v1 = r[slot * 4 + 3];

        const vTop = drop && face >= Face.NX ? v0 + Math.round(((v1 - v0) * (16 - LIQUID_DROP)) / 16): v1;
        
        for (let k = 0; k < 4; k++) {
            const o = (face * 4 + k) * 3;
            const cx = CORNERS[o], cy = CORNERS[o + 1], cz = CORNERS[o + 2];
            
            let cr = shade, cg = shade, cb = shade;
            if (tint) {
                const gi = ((bx + cx) * GRID + (bz + cz)) * 3;
                cr *= tint[gi]; cg *= tint[gi + 1]; cb *= tint[gi + 2];
            }

            this.vertex(
                (bx + cx) * VERTEX_SCALE,
                (by + cy) * VERTEX_SCALE - (drop && cy ? DROP_UNITS : 0),
                (bz + cz) * VERTEX_SCALE,
                UV_U[k] ? u1 : u0, UV_V[k] ? vTop : v0,
                cr, cg, cb
            );
        }
    }
    
    // both diagonal planes of cross block: full brightness, tint from nearest corner
    addCross(bx: number, by: number, bz: number, slot: number, tint: Float32Array | null) {
        const r = this.rects;

        const u0 = r[slot * 4];
        const v0 = r[slot * 4 + 1];
        const u1 = r[slot * 4 + 2];
        const v1 = r[slot * 4 + 3];
        
        for (const plane of CROSS) {
            this.ensure();
            for (let k = 0; k < 4; k++) {
                const px = plane[k * 3], py = plane[k * 3 + 1], pz = plane[k * 3 + 2];
                
                let cr = 1, cg = 1, cb = 1;
                if (tint) {
                    const gi = ((bx + (px > 8 ? 1 : 0)) * GRID + (bz + (pz > 8 ? 1 : 0))) * 3;
                    cr = tint[gi]; cg = tint[gi + 1]; cb = tint[gi + 2];
                }

                this.vertex(
                    bx * VERTEX_SCALE + (px * VERTEX_SCALE) / 16,
                    by * VERTEX_SCALE + (py * VERTEX_SCALE) / 16,
                    bz * VERTEX_SCALE + (pz * VERTEX_SCALE) / 16,
                    UV_U[k] ? u1 : u0, UV_V[k] ? v1 : v0,
                    cr, cg, cb,
                )
            }
        } 
    }

    private vertex(x: number, y: number, z: number, u: number, v: number, r: number, g: number, b: number) {
        const i = this.v++;

        this.pos[i * 3] = x;
        this.pos[i * 3 + 1] = y;
        this.pos[i * 3 + 2] = z;

        this.uv[i * 2] = u;
        this.uv[i * 2 + 1] = v;

        this.col[i * 4] = Math.round(r * 255);
        this.col[i * 4 + 1] = Math.round(g * 255);
        this.col[i * 4 + 2] = Math.round(b * 255);
        this.col[i * 4 + 3] = 255;
    }

    private ensure() {
        if (this.v + 4 <= this.cap) return;
        this.cap *= 2;
        const pos = new Uint16Array(this.cap * 3); pos.set(this.pos); this.pos = pos;
        const uv = new Uint16Array(this.cap * 2); uv.set(this.uv); this.uv = uv;
        const col = new Uint8Array(this.cap * 4); col.set(this.col); this.col = col;
    }

    // copies out used part to reuse buffer for next chunk
    finish(): GeometryData | null {
        const n = this.v;
        if (n === 0) return null;

        const quads = n / 4;
        let index: Uint16Array | Uint32Array;
        if (quads <= SHARED_QUADS) index = SHARED_INDEX.subarray(0, quads * 6);
        else { index = new Uint32Array(quads * 6); fillQuadIndices(index, quads); }

        return {
            attributes: {
                position: { array: this.pos.slice(0, n * 3), itemSize: 3 },
                uv: { array: this.uv.slice(0, n * 2), itemSize: 2, normalized: true },
                color: { array: this.col.slice(0, n * 4), itemSize: 4, normalized: true },
            },
            index,
        };
    }
}

export class Mesher {
    private readonly buffers: QuadBuffer[]; // by layer

    private readonly blocks: BlockRegistry;
    private readonly biomes: BiomeRegistry;
    private readonly colormap: Colormap;

    // linear tint colour per (tint, biome id)
    private readonly tintTable = new Float32Array(TINT_SLOTS * 256 * 3);
    private readonly tintKnown = new Uint8Array(TINT_SLOTS * 256);
    private readonly rgb = [0, 0, 0];

    // per-chunk tint grids, built lazily per tint and cleared on mesh()
    private readonly gridStore: (Float32Array | undefined)[] = [];
    private readonly grids: (Float32Array | null)[] = new Array(TINT_SLOTS).fill(null);

    constructor(blocks: BlockRegistry, biomes: BiomeRegistry, colormap: Colormap) {
        this.blocks = blocks;
        this.biomes = biomes;
        this.colormap = colormap;
        
        const slots = blocks.slotNames.length;
        const rects = new Uint16Array(slots * 4);

        for (let s = 0; s < slots; s++) {
            const r = blocks.slotRect(s);
            for (let i = 0; i < 4; i++) rects[s * 4 + i] = Math.round(r[i] * 65535);
        }

        this.buffers = [new QuadBuffer(rects), new QuadBuffer(rects), new QuadBuffer(rects)];
    }

    invalidateTints() { this.tintKnown.fill(0); }

    mesh(chunk: Chunk): Mesh | null {
        for (const b of this.buffers) b.reset();
        this.grids.fill(null);

        const { blocks } = this;
        const cells = chunk.blocks; 

        let yMin = WORLD_HEIGHT, yMax = 0;

        for (let x = 0; x < CHUNK_SIZE; x++) for (let z = 0; z < CHUNK_SIZE; z++) {
            const top = chunk.height(x, z);
            
            const lo = Math.max(0, Math.min(top,
                chunk.height(x - 1, z), chunk.height(x + 1, z),
                chunk.height(x, z - 1), chunk.height(x, z + 1),
            ));
            const hi = Math.min(WORLD_HEIGHT - 1, Math.max(top, SEA_LEVEL - 1));

            const column = Chunk.column(x, z);

            for (let y = lo; y <= hi; y++) {
                const id = cells[column + y];
                if (blocks.shape[id] === Shape.NONE) continue;

                if (this.meshBlock(chunk, x, y, z, column + y, id)) {
                    if (y < yMin) yMin = y;
                    if (y + 1 > yMax) yMax = y + 1;
                }
            }
        }

        const opaque = this.buffers[Layer.OPAQUE].finish();
        const cutout = this.buffers[Layer.CUTOUT].finish();
        const translucent = this.buffers[Layer.TRANSLUCENT].finish();
        if (!opaque && !cutout && !translucent) return null;
        return { opaque, cutout, translucent, yMin, yMax };
    }

    private meshBlock(chunk: Chunk, x: number, y: number, z: number, idx: number, id: number): boolean {
        const blocks = this.blocks, cells = chunk.blocks;
        const buf = this.buffers[blocks.layer[id]];

        if (blocks.shape[id] === Shape.CROSS) {
            const tint = blocks.faceTint[id * 6 + Face.PY];
            buf.addCross(x, y, z, blocks.faceSlot[id * 6 + Face.PY], tint ? this.tintGrid(tint as Tint, chunk) : null);
            return true;
        }

        const above = y + 1 < WORLD_HEIGHT ? cells[idx + 1] : BLOCK.AIR;
        const drop = !!blocks.liquid[id] && above !== id;

        let emitted = false;
        for (const face of ALL_FACES) {
            // x,z neighbors come from padded ring; below is solid STONE, above is AIR
            const nb = face === Face.PY ? above
                : face === Face.NY ? (y > 0 ? cells[idx - 1] : BLOCK.STONE)
                : cells[idx + STEP[face]];
            // hidden if neighbor occludes or is same non-occluding block
            if (nb === id || blocks.occludes[nb]) continue;

            const tint = blocks.faceTint[id * 6 + face];
            buf.addFace(
                x, y, z, face, blocks.faceSlot[id * 6 + face],
                SHADE[face], tint ? this.tintGrid(tint as Tint, chunk) : null, drop
            );
            emitted = true;
        }
        return emitted;
    }

    // offset of linear tint colour for (tint, biome) in tintTable
    private tintOffset(tint: Tint, biomeID: number): number {
        const k = tint * 256 + biomeID;
        if (!this.tintKnown[k]) {
            const biome = this.biomes.index(biomeID);
            const c = this.rgb;
            this.colormap.color(tint, biome.temperature, biome.downfall, c);
            
            this.tintTable[k * 3] = LIN[c[0]];
            this.tintTable[k * 3 + 1] = LIN[c[1]];
            this.tintTable[k * 3 + 2] = LIN[c[2]];
            this.tintKnown[k] = 1;
        }
        return k * 3;
    }

    // linear tint colour at every corner: average of four surrounding columns' biomes
    private tintGrid(tint: Tint, chunk: Chunk): Float32Array {
        const cached = this.grids[tint];
        if (cached) return cached;

        const grid = (this.gridStore[tint] ??= new Float32Array(GRID * GRID * 3));
        const table = this.tintTable;

        for (let gx = 0; gx < GRID; gx++) for (let gz = 0; gz < GRID; gz++) {
            let r = 0, g = 0, b = 0;
            for (let dx = -1; dx <= 0; dx++) for (let dz = -1; dz <= 0; dz++) {
                const o = this.tintOffset(tint, chunk.biome(gx + dx, gz + dz));
                r += table[o]; g += table[o + 1]; b += table[o + 2];
            }

            const i = (gx * GRID + gz) * 3;
            grid[i] = r / 4; grid[i + 1] = g / 4; grid[i + 2] = b / 4;
        }

        this.grids[tint] = grid;
        return grid;
    }
}
