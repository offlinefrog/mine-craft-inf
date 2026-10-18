import { CHUNK_SIZE, WORLD_HEIGHT } from "../config";
import { BLOCK } from "../world/blocks/blocks";
import { Chunk, ChunkStatus } from "../world/chunk";
import { newClimateSample } from "./climate-source";
import type { Context, Stage } from "./context";
import { CELL_H, CELL_W, newTerrainShape } from "./terrain-source";

/**
 *  noise stage: STONE where density > 0, WATER below sea level where density <= 0, otherwise AIR
 * 
 *  density evaluated once per cell corner and interpolated
 *  lattice anchored to world coords (x,z multiples of 4, y multiples of 8)
 *  adjacent chunks compute identical corners to agree on shared columns with no seams
 *  
 *  begins one cell before chunk to cover padding column at -1
 */

const PAD = 1;
const ORIGIN = -CELL_W;                 // local x/z of first corner
const CELLS = CHUNK_SIZE / CELL_W + 2;  // cells per horizontal axis (6)
const NC = CELLS + 1;                   // corners per horizontal axis (7)
const NY = WORLD_HEIGHT / CELL_H + 1;   // corners up to a column (49: WORLD_HEIGHT is a multiple of CELL_H)
const LAST = CHUNK_SIZE + PAD - 1;      // last padded column (16)

// scratch buffers: corner index = (ci * NC + ck) * NY + cj, ci along x and ck along z
const corners = new Float64Array(NC * NC * NY);
const sample = newClimateSample();
const shape = newTerrainShape();

const SOLID = BLOCK.STONE;
const FLUID = BLOCK.WATER;
const EMPTY = BLOCK.AIR;

function fillSolid(
    chunk: Chunk,
    lx0: number, lx1: number,
    lz0: number, lz1: number,
    y0: number
) {
    for (let lx = lx0; lx <= lx1; lx++) for (let lz = lz0; lz <= lz1; lz++) {
        const col = Chunk.column(lx, lz);
        chunk.blocks.fill(SOLID, col + y0, col + y0 + CELL_H);
        chunk.heights[Chunk.base(lx, lz)] = y0 + CELL_H - 1;
    }
}

function fillOpen(
    chunk: Chunk,
    lx0: number, lx1: number,
    lz0: number, lz1: number,
    y0: number,
    seaLevel: number
) {
    const wet = Math.max(0, Math.min(CELL_H, seaLevel - y0)); // layers of cell below sea level
    for (let lx = lx0; lx <= lx1; lx++) for (let lz = lz0; lz <= lz1; lz++) {
        const col = Chunk.column(lx, lz) + y0;
        if (wet > 0) chunk.blocks.fill(FLUID, col, col + wet);
        if (wet < CELL_H) chunk.blocks.fill(EMPTY, col + wet, col + CELL_H);
    }
}

export const noise: Stage = {
    status: ChunkStatus.Noise,

    run(ctx: Context, chunk: Chunk) {
        const { climate, terrain } = ctx;
        const seaLevel = terrain.seaLevel;
        
        const x0 = chunk.cx * CHUNK_SIZE + ORIGIN
        const z0 = chunk.cz * CHUNK_SIZE + ORIGIN;

        // density at every corner: climate, shape once per column, density once per corner
        for (let ci = 0; ci < NC; ci++) for (let ck = 0; ck < NC; ck++) {
            const wx = x0 + ci * CELL_W
            const wz = z0 + ck * CELL_W;
            
            climate.sample(wx, wz, sample);
            terrain.shape(sample, shape);
            
            const base = (ci * NC + ck) * NY;
            
            for (let cj = 0; cj < NY; cj++) corners[base + cj] = terrain.density(wx, cj * CELL_H, wz, shape);
        }

        // fill cell by cell, bottom to top
        const blocks = chunk.blocks;
        chunk.heights.fill(-1);

        for (let ci = 0; ci < CELLS; ci++) for (let ck = 0; ck < CELLS; ck++) {
            const cellX = ORIGIN + ci * CELL_W;
            const cellZ = ORIGIN + ck * CELL_W;

            const lx0 = Math.max(-PAD, cellX), lx1 = Math.min(LAST, cellX + CELL_W - 1);
            const lz0 = Math.max(-PAD, cellZ), lz1 = Math.min(LAST, cellZ + CELL_W - 1);

            const c00 = (ci * NC + ck) * NY
            const c10 = c00 + NC * NY;
            const c01 = c00 + NY;
            const c11 = c10 + NY;

            for (let cj = 0; cj < NY - 1; cj++) {
                const y0 = cj * CELL_H;

                const d000 = corners[c00 + cj], d010 = corners[c00 + cj + 1];
                const d100 = corners[c10 + cj], d110 = corners[c10 + cj + 1];
                const d001 = corners[c01 + cj], d011 = corners[c01 + cj + 1];
                const d101 = corners[c11 + cj], d111 = corners[c11 + cj + 1];

                const lo = Math.min(d000, d010, d100, d110, d001, d011, d101, d111);
                if (lo > 0) { fillSolid(chunk, lx0, lx1, lz0, lz1, y0); continue; }
                const hi = Math.max(d000, d010, d100, d110, d001, d011, d101, d111);
                if (hi <= 0) { fillOpen(chunk, lx0, lx1, lz0, lz1, y0, seaLevel); continue; }

                for (let lx = lx0; lx <= lx1; lx++) {
                    const tx = (lx - cellX) / CELL_W;
                    for (let lz = lz0; lz <= lz1; lz++) {
                        const tz = (lz - cellZ) / CELL_W;
                        
                        const bottom = (d000 * (1 - tx) + d100 * tx) * (1 - tz) + (d001 * (1 - tx) + d101 * tx) * tz;
                        const top    = (d010 * (1 - tx) + d110 * tx) * (1 - tz) + (d011 * (1 - tx) + d111 * tx) * tz;
                        
                        const step = (top - bottom) / CELL_H;

                        const col = Chunk.column(lx, lz);
                        const h = Chunk.base(lx, lz);

                        let d = bottom;
                        for (let y = y0; y < y0 + CELL_H; y++, d += step) {
                            if (d > 0) {
                                blocks[col + y] = SOLID;
                                chunk.heights[h] = y;
                            } else {
                                blocks[col + y] = y < seaLevel ? FLUID : EMPTY;
                            }
                        }
                    }
                }
            }
        }
    }
}
