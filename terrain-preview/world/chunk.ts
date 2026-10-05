export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 256;
export const SEA_LEVEL = 64;

export const ChunkStatus = {
    Empty: 0, Biomes: 1, Noise: 2
} as const;
export type ChunkStatus = typeof ChunkStatus[keyof typeof ChunkStatus];

/** Index of column (lx, lz) in any per-column array. Local coords 0..15. */
export const columnIndex = (lx: number, lz: number): number => lz * CHUNK_SIZE + lx;

/**
 * Index into Chunk.blocks for local (lx, lz) in 0..15 and y in 0..WORLD_HEIGHT-1.
 * Each column is contiguous (y varies fastest): terrain fills and heightmap scans walk columns.
 */
export const blockIndex = (lx: number, y: number, lz: number): number =>
  columnIndex(lx, lz) * WORLD_HEIGHT + y;

export class Chunk {
  status: ChunkStatus = ChunkStatus.Empty;
  readonly blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * WORLD_HEIGHT);
  /** Biome id per column (index with columnIndex). Written by the biomes stage. */
  readonly biomes = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
  readonly surfaceY = new Int16Array(CHUNK_SIZE * CHUNK_SIZE);
  readonly floorY = new Int16Array(CHUNK_SIZE * CHUNK_SIZE);
  
  readonly cx: number;
  readonly cz: number;
  
  constructor(cx: number, cz: number) {
    this.cx = cx;
    this.cz = cz;
  }
}
