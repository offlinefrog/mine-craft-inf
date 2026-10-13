// meshChunk returns MeshData necessary to create Three.js Mesh objects from the given Chunk

import { CHUNK_SIZE, VERTEX_SCALE, WORLD_HEIGHT } from "../config";
import { Layer, Shape, Tint } from "../world/blocks";
import { Chunk } from "../world/chunk";
import { colormap as defaultColormap, type Colormap } from "./colormap";
import { BlockRegistry } from "./block-registry";
import { registry } from "../generate/biomes/biome-registry";

const Face = { PY: 0, NY: 1, NX: 2, PX: 3, NZ: 4, PZ: 5 };
type Face = (typeof Face)[keyof typeof Face];

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
const DX = [0,  0, -1, 1,  0, 0];
const DY = [1, -1,  0, 0,  0, 0];
const DZ = [0,  0,  0, 0, -1, 1];

// two diagonal planes, double-sided
const CROSS = [
    [3,  0, 3,   13, 0, 13,   13, 16, 13,   3,  16, 3],
    [13, 0, 3,   3,  0, 13,   3,  16, 13,   13, 16, 3],
];

// vanilla face brightness, sRGB space multiplier -> linear space shader
const BRIGHTNESS = [1.0, 0.5, 0.6, 0.6, 0.8, 0.8];
const SHADE = BRIGHTNESS.map((b) => Math.pow(b, 2.2));
const LIN = new Float32Array(256).map((_, i) => Math.pow(i / 255, 2.2)); // sRGB byte -> linear
// top-most liquids sit 2/16 below block top
const LIQUID_DROP = 2;
// camera faces -Z so -Z is skipped
const SKIP_FACE = Face.NZ;
// tint sampled on grid of corners: 17 * 17 for 16 * 16 chunk
const GRID = CHUNK_SIZE + 1;

// dynamic quad buffer (4 vertices per quad)
class QuadBuffer {
    private cap = 1024;
    private pos = new Uint16Array(this.cap * 3);
    private uv = new Uint16Array(this.cap * 2);
    private col = new Uint8Array(this.cap * 4);
    v = 0;

    reset() { this.v = 0; }

    // adds one cube face. shade: linear brightness;
    // grid: linear rgb per block corner multiplies in tint;
    // drop lowers top vertices for liquids
    addFace(
        bx: number, by: number, bz: number, face: number, r: Uint16Array,
        slot: number, shade: number, grid: Float32Array | null, drop: number
    ) {
        this.ensure();
        const u0 = r[slot * 4], v0 = r[slot * 4 + 1], u1 = r[slot * 4 + 2], v1 = r[slot * 4 + 3];
        const vTop = drop && face >= Face.NX ? v0 + Math.round(((v1 - v0) * (16 - drop)) / 16): v1;
        
        for (let k = 0; k < 4; k++) {
            const o = (face * 4 + k) * 3;
            const cx = CORNERS[o], cy = CORNERS[o + 1], cz = CORNERS[o + 2];
            
            let cr = shade, cg = shade, cb = shade;
            if (grid) {
                const gi = ((bx + cx) * GRID + (bz + cz)) * 3;
                cr *= grid[gi]; cg *= grid[gi + 1]; cb *= grid[gi + 2];
            }

            this.vertex(
                (bx + cx) * VERTEX_SCALE,
                (by + cy) * VERTEX_SCALE - (cy ? (drop * VERTEX_SCALE) / 16 : 0),
                (bz + cz) * VERTEX_SCALE,
                UV_U[k] ? u1 : u0, UV_V[k] ? vTop : v0,
                cr, cg, cb
            );
        }
    }
    
    // both diagonal planes of cross block (full brightness, tint from nearest corner)
    addCross(
        bx: number, by: number, bz: number, r: Uint16Array,
        slot: number, grid: Float32Array | null
    ) {
        const u0 = r[slot * 4], v0 = r[slot * 4 + 1], u1 = r[slot * 4 + 2], v1 = r[slot * 4 + 3];
        
        for (const plane of CROSS) {
            this.ensure();
            for (let k = 0; k < 4; k++) {
                const px = plane[k * 3], py = plane[k * 3 + 1], pz = plane[k * 3 + 2];
                
                let cr = 1, cg = 1, cb = 1;
                if (grid) {
                    const gi = ((bx + (px > 8 ? 1 : 0)) * GRID + (bz + (pz > 8 ? 1 : 0))) * 3;
                    cr = grid[gi]; cg = grid[gi + 1]; cb = grid[gi + 2];
                }

                this.vertex(
                    bx * VERTEX_SCALE + (px * VERTEX_SCALE) / 16,
                    by * VERTEX_SCALE + (py * VERTEX_SCALE) / 16,
                    bz * VERTEX_SCALE + (pz * VERTEX_SCALE) / 16,
                    UV_U[k] ? u1 : u0, UV_V[k] ? v1 : v0,
                    cr, cg, cb
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

    finish(): GeometryData | null {
        const n = this.v;
        if (n === 0) return null;

        const quads = n / 4;
        const index = n > 65535 ? new Uint32Array(quads * 6) : new Uint16Array(quads * 6);
        for (let q = 0, i = 0; q < quads; q++) {
            const b = q * 4;
            index[i++] = b; index[i++] = b + 1; index[i++] = b + 2;
            index[i++] = b; index[i++] = b + 2; index[i++] = b + 3;
        }
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
    yMin?: number;
    yMax?: number;
}

export class Mesher {
    private readonly buffers: QuadBuffer[] = [new QuadBuffer(), new QuadBuffer(), new QuadBuffer()]; // by layer
    private readonly rects: Uint16Array; // per slot: u0 v0 u1 v1 normalized to 0..65535
    private readonly colormap: Colormap;

    private readonly gridStore: (Float32Array | undefined)[] = [];
    private readonly grids: (Float32Array | null)[] = new Array(8).fill(null);
    private readonly tmp = [0, 0, 0];

    private readonly registry: BlockRegistry

    constructor(registry: BlockRegistry, colormap?: Colormap) {
        this.colormap = colormap ?? defaultColormap;
        
        const slots = registry.slotNames.length;
        this.rects = new Uint16Array(slots * 4);

        for (let s = 0; s < slots; s++) {
            const r = registry.slotRect(s);
            for (let i = 0; i < 4; i++) this.rects[s * 4 + i] = Math.round(r[i] * 65535);
        }

        this.registry = registry;
    }

    mesh(chunk: Chunk): Mesh | null {
        const { registry, buffers, rects } = this;
        for (const b of buffers) b.reset();
        this.grids.fill(null);
        let minY = WORLD_HEIGHT, maxY = 0;

        for (let x = 0; x < CHUNK_SIZE; x++) for (let z = 0; z < CHUNK_SIZE; z++) {
            const base = Chunk.column(x, z);
            const top = chunk.height(x, z);

            for (let y = 0; y <= top; y++) {
                const id = chunk.blocks[base + y];
                const shape = registry.shape[id];
                if (shape === Shape.NONE) continue;

                const buf = buffers[registry.layer[id]];
                if (shape === Shape.CROSS) {
                    const tint = registry.faceTint[id * 6 + Face.PY];
                    buf.addCross(x, y, z, rects, registry.faceSlot[id * 6 + Face.PY], tint ? this.grid(tint as Tint, chunk) : null);

                    if (y < minY) minY = y;
                    if (y + 1 > maxY) maxY = y + 1;
                    continue;
                }

                const drop = registry.liquid[id] && chunk.block(x, y + 1, z) !== id ? LIQUID_DROP : 0;
                let emitted = false;
                for (let face = 0; face < 6; face++) {
                    if (face === SKIP_FACE) continue;
                    
                    const nb = chunk.block(x + DX[face], y + DY[face], z + DZ[face]);
                    // skipped (hidden) if occludes or non-occluding neighbor is the same block (leaves/leaves, water/water)
                    if (nb === id || registry.occludes[nb]) continue;

                    const tint = registry.faceTint[id * 6 + face];
                    buf.addFace(
                        x, y, z, face, rects, registry.faceSlot[id * 6 + face],
                        SHADE[face], tint ? this.grid(tint as Tint, chunk): null, drop
                    );
                    emitted = true;
                }
                if (emitted) {
                    if (y < minY) minY = y;
                    if (y + 1 > maxY) maxY = y + 1;
                }
            }
        }

        const opaque = buffers[Layer.OPAQUE].finish();
        const cutout = buffers[Layer.CUTOUT].finish();
        const translucent = buffers[Layer.TRANSLUCENT].finish();
        if (!opaque && !cutout && !translucent) return null;
        return { opaque, cutout, translucent, yMin: minY, yMax: maxY };
    }

    // linear tint color at every corner using padded biomes
    private grid(tint: Tint, chunk: Chunk): Float32Array {
        const cached = this.grids[tint];
        if (cached) return cached;

        const g = (this.gridStore[tint] ??= new Float32Array(GRID * GRID * 3));
        const c = this.tmp;

        for (let gx = 0; gx < GRID; gx++) for (let gz = 0; gz < GRID; gz++) {
            let r = 0, gg = 0, b = 0;
            for (let dx = -1; dx <= 0; dx++) for (let dz = -1; dz <= 0; dz++) {
                const biome = registry.get(chunk.biome(gx + dx, gz + dz));
                this.colormap.color(tint, biome.temperature, biome.downfall, c);
                
                r += LIN[c[0]]; gg += LIN[c[1]]; b += LIN[c[2]];
            }

            const i = (gx * GRID + gz) * 3;
            g[i] = r / 4;
            g[i + 1] = gg / 4;
            g[i + 2] = b / 4;
        }

        this.grids[tint] = g;
        return g;
    }
}
