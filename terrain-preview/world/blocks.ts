/** Block ids stored in Chunk.blocks (one byte each). More are added as stages need them. */
export const BLOCK = { AIR: 0, STONE: 1, WATER: 2 } as const;
export type BlockId = (typeof BLOCK)[keyof typeof BLOCK];
