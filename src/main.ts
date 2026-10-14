import { MAX_FRAME_DT, PRIME_RADIUS, SEED } from "./config";

import { BlockRegistry } from "./world/blocks/block-registry";
import { BiomeRegistry } from "./world/biomes/biome-registry";

import { Colormap } from "./world/blocks/colormap";
import { createContext } from "./generate/context";
import { TextureAtlas } from "./render/atlas";
import { createMaterials } from "./render/materials";

import { Mesher } from "./mesh/mesh";
import { Generator } from "./generate/generate";

import { Observer } from "./render/observer";
import { Renderer } from "./render/renderer";
import { Viewport } from "./render/viewport";

import { Stream } from "./stream/stream";

import { loadColorMaps, loadPackImages } from "./util/load-pack";

const blocks = new BlockRegistry();
const biomes = new BiomeRegistry();

const colormap = new Colormap();
const context = createContext(SEED);
const atlas = new TextureAtlas(blocks);
const materials = createMaterials(atlas);

const mesher = new Mesher(blocks, biomes, colormap);
const generator = new Generator(context);
// chunk builder pipeline initialized with generation and mesher

const canvas = document.querySelector("canvas")!;

const observer = new Observer(canvas.clientWidth / canvas.clientHeight);
const viewport = new Viewport(canvas, observer);
const renderer = new Renderer(viewport.scene, materials);

const stream = new Stream(builder, renderer);

// resource loader
const picker = document.createElement("input");
picker.type = "file";
picker.accept = ".zip,.jar";
Object.assign(picker.style, { position: "fixed", top: "8px", left: "8px", zIndex: "1" });
document.body.append(picker);

picker.onchange = async () => {
    const file = picker.files?.[0];
    if (!file) return;

    const [images, maps] = await Promise.all([loadPackImages([file], blocks.slotNames), loadColorMaps([file])]);
    atlas.build(images);
    colormap.set(maps.grass, maps.foliage);

    stream.reset();
}

// generation
let last = performance.now();
let primed = false;

function frame(now: number) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME_DT);
    last = now;

    if (primed) observer.update(dt);
    stream.update(observer.view);
    renderer.flush();
    if (!primed) {
        primed = stream.primed(observer.view, PRIME_RADIUS) && renderer.queued === 0;
    }
    viewport.render();
}

requestAnimationFrame(frame);
