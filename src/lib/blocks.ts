export const B = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    SAND: 4,
    SNOW: 5,
    WATER: 6,
    LOG: 7,
    LEAVES: 8,
    PINE: 9,
    CACTUS: 10,
    COBBLE: 11,
} as const;

export type B = (typeof B)[keyof typeof B];

export interface BlockType {
    color: [number, number, number];
    opaque: boolean;
    liquid?: boolean;
}

export const BLOCKS: BlockType[] = [
    { color: [0, 0, 0], opaque: false },
    { color: [0.36, 0.62, 0.22], opaque: true },
    { color: [0.45, 0.31, 0.19], opaque: true },
    { color: [0.48, 0.48, 0.5], opaque: true },
    { color: [0.84, 0.78, 0.55], opaque: true },
    { color: [0.95, 0.97, 1.0], opaque: true },
    { color: [0.18, 0.38, 0.8], opaque: false, liquid: true },
    { color: [0.38, 0.27, 0.15], opaque: true },
    { color: [0.2, 0.5, 0.15], opaque: true },
    { color: [0.12, 0.33, 0.2], opaque: true },
    { color: [0.2, 0.5, 0.25], opaque: true },
    { color: [0.4, 0.4, 0.42], opaque: true },
]
