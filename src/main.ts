import { BUILD_BUDGET_MS, MAX_FRAME_DT, PRIME_BUDGET_MS, PRIME_RADIUS, SEED } from "./config";

import { BlockRegistry } from "./world/blocks/block-registry";
import { BiomeRegistry } from "./world/biomes/biome-registry";

import { Colormap } from "./world/blocks/colormap";
import { createContext } from "./generate/context";
import { TextureAtlas } from "./render/atlas";
import { createMaterials } from "./render/materials";

import { Mesher } from "./build/mesh";
import { Generator } from "./generate/generate";

import { Observer } from "./render/observer";
import { Renderer } from "./render/renderer";
import { Viewport } from "./render/viewport";

import { Stream } from "./stream/stream";

import { loadColorMaps, loadPackImages } from "./util/load-pack";
import { Builder } from "./build/build";
import { makeSurfaceQuery } from "./util/query-surface";

const blocks = new BlockRegistry();
const biomes = new BiomeRegistry();

const colormap = new Colormap();
const context = createContext(SEED);
const atlas = new TextureAtlas(blocks);
const materials = createMaterials(atlas);

const generator = new Generator(context);
const mesher = new Mesher(blocks, biomes, colormap);
const builder = new Builder(generator, mesher);

const canvas = document.querySelector<HTMLCanvasElement>("canvas");
if (!canvas) throw new Error("Canvas element not found. Check index.html.");

const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
const observer = new Observer(aspect, makeSurfaceQuery(context));
const viewport = new Viewport(canvas, observer);
const renderer = new Renderer(viewport.scene, materials);

const stream = new Stream(builder, renderer);

// resource loader
const picker = document.createElement("input");
picker.type = "file";
picker.accept = ".zip,.jar";
Object.assign(picker.style, { position: "fixed", top: "8px", left: "8px", zIndex: "1" });
document.body.append(picker);

let primed = false;

picker.onchange = async () => {
    const file = picker.files?.[0];
    if (!file) return;

    const [images, maps] = await Promise.all([loadPackImages([file], blocks.slotNames), loadColorMaps([file])]);
    atlas.build(images);
    colormap.set(maps.grass, maps.foliage);

    mesher.invalidateTints();
    stream.reset();
    primed = false;
}

// generation
let last = performance.now();

function frame(now: number) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME_DT);
    last = now;

    if (primed) observer.update(dt);
    
    stream.update(observer.view, primed ? BUILD_BUDGET_MS : PRIME_BUDGET_MS);
    renderer.flush();
    if (!primed) primed = stream.primed(observer.view, PRIME_RADIUS) && renderer.queued === 0;
    
    viewport.render();
}

requestAnimationFrame(frame);
