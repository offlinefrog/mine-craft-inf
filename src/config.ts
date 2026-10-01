const q = new URLSearchParams(location.search);
export const SEED = Number(q.get('seed')) ?? 1337;

export const CS = 16;
export const HEIGHT = 96;
export const SEA = 28;

export const DEPTH = 8;
export const AHEAD = 8;
export const BEHIND = 8;

export const GEN_BUDGET = 3;
export const MESH_BUDGET = 2;

export const SPEED = 20;
export const CAM_Z = 6;

export const FOG_NEAR = 40;
export const FOG_FAR = 125;
