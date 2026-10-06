//const q = new URLSearchParams(location.search);
export const SEED = 1337; //Number(q.get('seed') ?? 1337);

export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 256;
export const SEA_LEVEL = 62;

export const CHUNK_DEPTH = 20;
export const FOG_FAR = CHUNK_DEPTH * CHUNK_SIZE - 3;
export const FOG_NEAR = Math.round(FOG_FAR * 0.32);
export const WORLD_DEPTH = Math.round(FOG_FAR * 2.2);

export const CAMERA_START = CHUNK_SIZE / 2;
export const CAMERA_Y = SEA_LEVEL + 30;
export const CAMERA_Z = 6;

export const CAMERA_FOV = 60;
export const CAMERA_SPEED = 0;
