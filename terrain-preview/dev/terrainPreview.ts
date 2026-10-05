/**
 * Dev tool: generate a square of chunks and render views to judge the terrain by eye.
 *   tsx src/tools/terrainPreview.ts [seed=1] [chunks=64] [outDir=.] [clearance=on|off]
 *   terrain_map.png    top-down hillshaded map, with the camera route (red) and the camera (yellow)
 *   terrain_slice.png  vertical cross-section along the route
 *   terrain_cross.png  vertical cross-section ACROSS the route at the camera (shows the cleared valley)
 *   terrain_view.png   views from the camera at its fixed height: ahead, 60 degrees left, 60 degrees right
 *                      (height field only: overhangs are not drawn)
 */
import { BLOCK } from "../world/blocks";
import { WORLD_HEIGHT } from "../../src/config";
import { CHUNK_SIZE, blockIndex } from "../../src/world/chunk";
import { Clearance, DEFAULT_CLEARANCE_CONFIG } from "../../src/world-generation/noise/clearance";
import { Context as GenContext } from "../../src/world-generation/chunk-generation/context";
import { generateChunk } from "../../src/world-generation/chunk-generation/pipeline";
import { writePng } from "./png";

const [seedArg, chunksArg, outArg, clearanceArg] = process.argv.slice(2);
const seed = Number(seedArg ?? 1), chunks = Number(chunksArg ?? 64), outDir = outArg ?? ".";
const N = chunks * CHUNK_SIZE, HALF = N / 2;                          // the region covers world x, z in [-HALF, HALF)
const ctx = new GenContext(seed, undefined, undefined, undefined, clearanceArg === "off" ? null : DEFAULT_CLEARANCE_CONFIG);
const SEA = ctx.terrain.config.seaLevel;
const probe = ctx.clearance ?? new Clearance();                  // the route, even when clearance is off
const route = probe.route, cameraY: number = ctx.clearance?.cameraY ?? DEFAULT_CLEARANCE_CONFIG.cameraY;

// camera: on the route near the start of the region, looking along it
const s0 = -HALF + 70, cam = route.at(s0), ahead = route.at(s0 + 60);
const heading = Math.atan2(ahead.z - cam.z, ahead.x - cam.x);
const camX = Math.floor(cam.x + HALF), camZ = Math.floor(cam.z + HALF);
const routeZ = new Int32Array(N);                                      // route z at each x column, for the along-route slice
for (let x = 0; x < N; x++) routeZ[x] = Math.round(route.at(x - HALF).z) + HALF;

// ---- generate, and reduce every column to: top y, bed y (top solid), plus the two slices
const top = new Int16Array(N * N), bed = new Int16Array(N * N);
const slice = new Uint8Array(N * WORLD_HEIGHT);                        // along the route: [x * H + y]
const cross = new Uint8Array(N * WORLD_HEIGHT);                        // across the route at the camera: [z * H + y]
const t0 = performance.now();
for (let cz = 0; cz < chunks; cz++) for (let cx = 0; cx < chunks; cx++) {
  const chunk = generateChunk(ctx, cx - chunks / 2, cz - chunks / 2);
  for (let lz = 0; lz < CHUNK_SIZE; lz++) for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    const col = blockIndex(lx, 0, lz), x = cx * CHUNK_SIZE + lx, z = cz * CHUNK_SIZE + lz;
    let t = -1, b = -1;
    for (let y = WORLD_HEIGHT - 1; y >= 0; y--) {
      const id = chunk.blocks[col + y];
      if (t < 0 && id !== BLOCK.AIR) t = y;
      if (id === BLOCK.STONE) { b = y; break; }
    }
    top[z * N + x] = t; bed[z * N + x] = b;
    if (z === routeZ[x]) for (let y = 0; y < WORLD_HEIGHT; y++) slice[x * WORLD_HEIGHT + y] = chunk.blocks[col + y];
    if (x === camX) for (let y = 0; y < WORLD_HEIGHT; y++) cross[z * WORLD_HEIGHT + y] = chunk.blocks[col + y];
  }
}
console.log(`clearance ${ctx.clearance ? "ON" : "OFF"}: generated ${chunks * chunks} chunks (${N}x${N} blocks) in ${((performance.now() - t0) / 1000).toFixed(1)} s`);

// ---- colours
type RGB = [number, number, number];
const ramp = (stops: [number, RGB][]) => (v: number): RGB => {
  if (v <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) {
    const [a, ca] = stops[i - 1], [b, cb] = stops[i], t = (v - a) / (b - a);
    return [ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t];
  }
  return stops[stops.length - 1][1];
};
const land = ramp([[SEA - 4, [214, 200, 150]], [SEA + 2, [96, 150, 70]], [SEA + 22, [70, 125, 60]], [SEA + 45, [128, 118, 84]], [SEA + 65, [150, 148, 145]], [SEA + 85, [248, 248, 250]]]);
const water = ramp([[0, [120, 190, 215]], [6, [50, 120, 190]], [20, [20, 55, 130]]]);
const SKY_TOP: RGB = [96, 150, 220], SKY_LOW: RGB = [200, 222, 240];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const shade = new Float32Array(N * N);                                 // light from the north-west, from the bed slope
for (let z = 1; z < N - 1; z++) for (let x = 1; x < N - 1; x++) {
  const dx = bed[z * N + x + 1] - bed[z * N + x - 1], dz = bed[(z + 1) * N + x] - bed[(z - 1) * N + x];
  shade[z * N + x] = Math.min(1.25, Math.max(0.55, 0.9 - 0.2 * (dx + dz)));
}
const columnColour = (i: number): RGB => {
  const t = top[i], b = bed[i], s = shade[i] || 0.9;
  if (t > b) { const c = water(Math.min(30, SEA - b)); return [c[0] * (0.9 + 0.1 * s), c[1] * (0.9 + 0.1 * s), c[2] * (0.9 + 0.1 * s)]; }
  const c = land(b); return [c[0] * s, c[1] * s, c[2] * s];
};

// ---- 1. map, with the route and the camera
{
  const rgb = new Uint8Array(N * N * 3);
  for (let i = 0; i < N * N; i++) { const c = columnColour(i); rgb[i * 3] = c[0]; rgb[i * 3 + 1] = c[1]; rgb[i * 3 + 2] = c[2]; }
  const dot = (x: number, z: number, r: number, c: RGB) => { for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) { const px = x + k, pz = z + j; if (px >= 0 && pz >= 0 && px < N && pz < N) { const o = (pz * N + px) * 3; rgb[o] = c[0]; rgb[o + 1] = c[1]; rgb[o + 2] = c[2]; } } };
  for (let s = -HALF; s < HALF; s += 2) { const p = route.at(s); dot(Math.round(p.x + HALF), Math.round(p.z + HALF), 1, [230, 40, 40]); }
  dot(camX, camZ, 5, [255, 230, 40]);
  writePng(`${outDir}/terrain_map.png`, rgb, N, N);
}

// ---- 2/3. slices (2x vertical)
const sliceImage = (data: Uint8Array, width: number, file: string, marker?: number) => {
  const V = 2, H = WORLD_HEIGHT * V, rgb = new Uint8Array(width * H * 3);
  for (let x = 0; x < width; x++) for (let py = 0; py < H; py++) {
    const y = WORLD_HEIGHT - 1 - Math.floor(py / V), id = data[x * WORLD_HEIGHT + y];
    let c: RGB = id === BLOCK.STONE ? [118 - y * 0.25, 112 - y * 0.2, 104] : id === BLOCK.WATER ? [40, 100, 175] : mix(SKY_LOW, SKY_TOP, y / WORLD_HEIGHT);
    if (id === BLOCK.AIR && Math.abs(y - cameraY) < 0.6) c = [230, 40, 40];                  // the camera's fixed height
    if (marker !== undefined && x === marker && id === BLOCK.AIR) c = [255, 230, 40];
    const o = (py * width + x) * 3; rgb[o] = c[0]; rgb[o + 1] = c[1]; rgb[o + 2] = c[2];
  }
  writePng(file, rgb, width, H);
};
sliceImage(slice, N, `${outDir}/terrain_slice.png`);
sliceImage(cross, N, `${outDir}/terrain_cross.png`, camZ);

// ---- 4. views from the camera at its fixed height ("voxel space" ray marching over the height field)
{
  const W = 1000, PANEL = 300, hfov = (75 * Math.PI) / 180, focal = (W / 2) / Math.tan(hfov / 2), horizon = Math.floor(PANEL * 0.55);
  const MAXD = 480, rgb = new Uint8Array(W * PANEL * 3 * 3);
  const headings = [heading, heading - Math.PI / 3, heading + Math.PI / 3];
  headings.forEach((h0, v) => {
    const base = v * PANEL * W * 3;
    for (let y = 0; y < PANEL; y++) { const c = mix(SKY_TOP, SKY_LOW, Math.min(1, y / horizon)); for (let x = 0; x < W; x++) { const o = base + (y * W + x) * 3; rgb[o] = c[0]; rgb[o + 1] = c[1]; rgb[o + 2] = c[2]; } }
    for (let sx = 0; sx < W; sx++) {
      const ang = h0 + Math.atan((sx - W / 2) / focal), dx = Math.cos(ang), dz = Math.sin(ang), cosOff = Math.cos(ang - h0);
      let lowest = PANEL;
      for (let d = 1; d < MAXD; d += 0.6 + d * 0.004) {
        const wx = Math.floor(camX + dx * d), wz = Math.floor(camZ + dz * d);
        if (wx < 1 || wz < 1 || wx >= N - 1 || wz >= N - 1) break;
        const i = wz * N + wx, surf = Math.max(top[i], SEA) + 1;
        const screen = Math.floor(horizon - (focal * (surf - cameraY)) / (d * cosOff));
        if (screen >= lowest) continue;
        const fog = Math.min(1, Math.pow(d / MAXD, 1.4)), col = mix(columnColour(i), SKY_LOW, fog * 0.85);
        for (let y = Math.max(0, screen); y < lowest; y++) { const o = base + (y * W + sx) * 3; rgb[o] = col[0]; rgb[o + 1] = col[1]; rgb[o + 2] = col[2]; }
        lowest = Math.max(0, screen);
        if (lowest === 0) break;
      }
    }
  });
  writePng(`${outDir}/terrain_view.png`, rgb, W, PANEL * 3);
  console.log(`camera at (${cam.x.toFixed(0)}, ${cam.z.toFixed(0)}), fixed height y=${cameraY}; views: ahead, 60 left, 60 right`);
}
