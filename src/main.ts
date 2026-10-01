import { SEED, SPEED } from './config';
import { World } from './world/world';
import { ChunkStreamer } from './world/ChunkStreamer';
import { TerrainGenerator } from './generation/TerrainGenerator';
import { WorldGenerator } from './generation/WorldGenerator';
import { ChunkRenderer } from './rendering/ChunkRenderer';
import { CameraRig } from './rendering/CameraRig';
import { Renderer } from './rendering/Renderer';

const renderer = new Renderer();
const terrain = new TerrainGenerator(SEED);
const world = new World();
const chunkRenderer = new ChunkRenderer();
renderer.scene.add(chunkRenderer.group);
const streamer = new ChunkStreamer(world, new WorldGenerator(terrain, SEED), chunkRenderer);
const rig = new CameraRig(renderer.camera, terrain);

streamer.update(rig.x, 1e9);

const hud = document.getElementById('hud');
let last = performance.now(), fps = 60;

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  fps += (1 / dt - fps) * 0.05;

  rig.update(dt);
  streamer.update(rig.x);
  renderer.render();

  if (hud) {
    hud.textContent =
    `seed ${SEED}  ·  ${fps.toFixed(0)} fps\n` +
    `x ${rig.x.toFixed(0)}  ·  ${SPEED.toFixed(1)} blocks/s\n` +
    `biome ${terrain.column(rig.x, -24).b.name}  ·  chunks ${world.chunks.size}`;
  }
  
  requestAnimationFrame(frame);

}

requestAnimationFrame(frame);
