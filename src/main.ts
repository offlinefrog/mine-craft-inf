import { SEED } from './config';

import { registry } from "./blocks/registry";

import { TerrainGenerator } from './generation/terrain-generation';

//import { Sky } from './rendering/sky';
import { loadPack } from './rendering/resource-pack';
import { TextureAtlas } from './rendering/texture-atlas';
import { ChunkRenderer } from './rendering/chunk-rendering';
import { CameraRig } from './rendering/camera-rig';
import { Renderer } from './rendering/rendering';

import { ChunkStreamer } from './world/chunk-streaming';

const renderer = new Renderer();
const terrainGenerator = new TerrainGenerator(SEED);
const atlas = new TextureAtlas(registry);
const chunkRenderer = new ChunkRenderer(atlas);
renderer.scene.add(chunkRenderer.group);
const streamer = new ChunkStreamer(chunkRenderer);
const rig = new CameraRig(renderer.camera);
//const sky = new Sky(renderer.scene);

const hud = document.getElementById('hud')!;

let packName = 'none (generated tiles)';
async function applyPack(file: File) {
  try {
    const p = await loadPack(file);
    atlas.build(p.blocks);
    streamer.setColormap(p.grass, p.foliage);
    packName = file.name;
  } catch (e) {
    console.error('Resource pack failed to load', e);
    packName = 'failed: ' + file.name;
  }
}

const picker = document.createElement('input');
picker.type = 'file';
picker.accept = '.zip';
picker.onchange = () => {
  const f = picker.files?.[0];
  if (f) void applyPack(f);
};

addEventListener('keydown', (e) => {
  if (e.code === 'KeyP') picker.click();
});
addEventListener('dragover', (e) => e.preventDefault());
addEventListener('drop', (e) => {
  e.preventDefault();
  const f = e.dataTransfer?.files[0];
  if (f) void applyPack(f);
});

let last = performance.now(), fps = 60;

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  fps += (1 / dt - fps) * 0.05;

  rig.update(dt);
  streamer.update(rig.x);
  chunkRenderer.update(now / 1000);
  //sky.update(now / 1000, renderer.camera.position);
  //chunkRenderer.setLight(sky.light);
  renderer.render();

  const info = renderer.gl.info.render;
  hud.textContent = 
    `seed ${SEED}  ·  ${fps.toFixed(0)} fps\n` +
    `x ${rig.x.toFixed(0)}  ·  ${rig.speed.toFixed(1)} blocks/s\n` +
    `biome ${terrainGenerator.column(rig.x, -24).biome.name}\n` +
    `chunks ${chunkRenderer.count()}  ·  ${streamer.queued()} queued\n` +
    `draw calls ${info.calls}  ·  ${(info.triangles / 1000).toFixed(0)}k tris\n` +
    `pack ${packName}  ·  drop a .zip or press P`;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
