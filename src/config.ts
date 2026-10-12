// World
export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 256;

// Observer
export const FOV = 70;
export const CAM_HEIGHT = 1.62;
export const CAM_SPEED = 4.317;
export const HEIGHT_SMOOTHING = 6;  // 1/s exponential damping of terrain movement

// View
export const WORLD_DEPTH = 256;
export const CAM_NEAR = 0.1;
export const CAM_FAR = WORLD_DEPTH + 2 * CHUNK_SIZE;

export const SKY = 0x87ceeb;

// Stream
export const BEHIND_DISTANCE = CHUNK_SIZE;
export const SIDE_MARGIN = CHUNK_SIZE;
export const REFRESH_STEP = CHUNK_SIZE / 2;
export const UNLOAD_MARGIN = 2 * CHUNK_SIZE;
export const BUILD_LATENCY = 1.5;
export const LOOKAHEAD = Math.ceil(CAM_SPEED * BUILD_LATENCY) + CHUNK_SIZE;
export const MAX_INFLIGHT = Math.max(
    1, Math.min(4, (typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 4) - 1)
);

export const MAX_FRAME_DT = 0.1;
export const UPLOADS_PER_FRAME = 3; // finished meshes turned into GPU geometry per frame
export const PRIME_RADIUS = 6 * CHUNK_SIZE; // observer waits until this near-field is meshed


/**
 *  notes
 *  world height/depth extended to 256 (16 chunks) or 512 (32 chunks)
 *  THREE camera faces -Z for +X rightward, meshing can skip the non-visible face
 *  is having both Region and World unnecessary?
 *  Chunk.biomes can be expanded to have 18*18 padding
 *  how much more inefficient is a string chunk key compared to a number?
 */