//const q = new URLSearchParams(location.search);
//export const SEED = Number(q.get('seed') ?? 1337);
export const SEED = 1337;

// World
export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 384;
export const SEA_LEVEL = 63;

// Observer" moves +X, looks towards -Z, follows terrain
export const FOV = 70;
export const CAM_HEIGHT = 1.62; // eye height above highest surface in view window
export const MIN_CLEARANCE = 1; // hard floor above surface directly under camera
export const CAM_SPEED = 4.317; 

export const CAM_LOOKBEHIND = 8;
export const CAM_LOOKAHEAD = 32;
export const SAMPLE_STEP = 4;
export const TAU_UP = 0.25;
export const TAU_DOWN = 1.2;

export const FOCUS_Y = 64;
export const FOCUS_DISTANCE = 200;

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
export const BUILD_BUDGET_MS = 6;  // generation + meshing per frame once running
export const PRIME_BUDGET_MS = 30; // per frame whiel first near-field loads

export const MAX_FRAME_DT = 0.1;
export const UPLOAD_VERTEX_BUDGET = 40_000; // vertices turned into GPU geometry per frame
export const PRIME_RADIUS = 6 * CHUNK_SIZE; // observer waits until this near-field is meshed
