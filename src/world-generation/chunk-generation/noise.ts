import { CHUNK_SIZE, WORLD_HEIGHT } from "../../config";
import { BLOCK } from "../../world/blocks/blocks";
import { Chunk, ChunkStatus } from "../../world/chunk";
import { newClimateSample } from "../climate-sample";
import { newTerrainShape } from "../terrain-sample";
import type { Context } from "./context";

// density is computed on a coarse grid of corners and interpolated between them for performance
// cells are 4x4x4 blocks, at world coordinate multiples of 4
// a single block's density depends on the cell's eight corners
const CELL = 4;
const NX = CHUNK_SIZE / CELL + 1;       // corners across chunk: 5
const NY = WORLD_HEIGHT / CELL + 1;     // corners up column: 65

/**
 *  Noise stage: fills Chunk.blocks with
 *      STONE where density > 0,
 *      WATER where density < 0 below sea level,
 *      AIR elsewhere
 *  everything sampled in world coords
 */
export const noiseStage = {
    status: ChunkStatus.Noise,
    neighborRadius: 0,
    
    run(ctx: Context, chunk: Chunk): void {
        const { climate, terrain, clearance } = ctx;
        const seaLevel = terrain.config.seaLevel;
        const sample = newClimateSample(), shape = newTerrainShape();
        const corners = new Float64Array(NX * NX * NY);     // index by (gz * NX + gx) * NY + gy

        // density at every cell corner
        for (let gz = 0; gz < NX; gz++) for (let gx = 0; gx < NX; gx++) {
            const wx = chunk.cx * CHUNK_SIZE + gx * CELL, wz = chunk.cz * CHUNK_SIZE + gz * CELL;
            terrain.shape(climate.sample(wx, wz, sample), shape);
            clearance?.apply(wx, wz, shape);    // keeps terrain near camera low

            const base = (gz * NX + gx) * NY;
            for (let gy = 0; gy < NY; gy++) corners[base + gy] = terrain.density(wx, gy * CELL, wz, shape);
        }

        // interpolate within cells
        const blocks = chunk.blocks;
        for (let cz = 0; cz < CHUNK_SIZE / CELL; cz++) for (let cx = 0; cx < CHUNK_SIZE / CELL; cx++) {
            // four corner columns of cell column by (x, z) offset
            const col00 = (cz * NX + cx) * NY, col10 = col00 + NY, col01 = col00 + NX * NY, col11 = col01 + NY;
            for (let cy = 0; cy < WORLD_HEIGHT / CELL; cy++) {
                // corner densities d<x><y><z> with 0 = low side, 1 = high side
                const d000 = corners[col00 + cy], d010 = corners[col00 + cy + 1];
                const d100 = corners[col10 + cy], d110 = corners[col10 + cy + 1];
                const d001 = corners[col01 + cy], d011 = corners[col01 + cy + 1];
                const d101 = corners[col11 + cy], d111 = corners[col11 + cy + 1];

                for (let lz = 0; lz < CELL; lz++) {
                    const tz = lz / CELL;
                    for (let lx = 0; lx < CELL; lx++) {
                        const tx = lx / CELL;

                        const bottom = (d000 * (1 - tx) + d100 * tx) * (1 - tz) + (d001 * (1 - tx) + d101 * tx) * tz;
                        const top = (d010 * (1 - tx) + d110 * tx) * (1 - tz) + (d011 * (1 - tx) + d111 * tx) * tz;
                        const col = Chunk.index(cx * CELL + lx, cy * CELL, cz * CELL + lz);
                        for (let ly = 0; ly < CELL; ly++) {
                            const y = cy * CELL + ly;
                            const d = bottom + (top - bottom) * (ly / CELL);
                            blocks[col + ly] = d > 0 ? BLOCK.STONE : y < seaLevel ? BLOCK.WATER : BLOCK.AIR;
                        }
                    }
                }
            }
        }

        chunk.status = ChunkStatus.Noise;
    }
}
