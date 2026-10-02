const q = new URLSearchParams(location.search);
export const SEED = Number(q.get('seed') ?? 1337);

export const BIG = !q.has('small');

export const CHUNK_SIZE = 16;               // chunk dimensions in X, Z
export const MAX_HEIGHT = BIG ? 320 : 96;   // world height Y
export const SEA_LEVEL = BIG ? 63 : 28;     // highest water
export const TOP = MAX_HEIGHT - 14;         // highest block (room for trees)

export const V_SCALE = (TOP - SEA_LEVEL) / 54;
export const H_SCALE = Math.sqrt(V_SCALE);
export const lvl = (f: number) => Math.round(SEA_LEVEL + f * (TOP - SEA_LEVEL));

export const DEPTH = BIG ? 20 : 8;
export const FOG_FAR = DEPTH * CHUNK_SIZE - 3;
export const FOG_NEAR = Math.round(FOG_FAR * 0.32);
export const FAR = Math.round(FOG_FAR * 2.2);
export const CAM_FOV = 70;

export const AHEAD = Math.ceil(FOG_FAR / CHUNK_SIZE);
export const BEHIND = AHEAD;

export const SPEED_START = 3 * H_SCALE;     // blocks/s
export const SPEED_ACCEL = 0.04 * H_SCALE;
export const SPEED_MAX = 12 * H_SCALE;

export const CAM_EYE_HEIGHT = 1.62;
export const CAM_GROUND_Z = -1;
export const CAM_Z = 2;
export const CAM_PITCH = -0.02;

export const WORKERS = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1));
export const APPLY_MS = 4;      // main thread time per frame for meshes -> THREE objects

export const DAY_SECONDS = 420;
export const DAY_START = 0.08;
