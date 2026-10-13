import { MAX_FRAME_DT, PRIME_RADIUS } from "./config";
import { colormap } from "./world/blocks/colormap";
import { loadColorMaps, loadPackImages } from "./mesh/load-pack";
import { registry } from "./world/blocks/block-registry";
import { TextureAtlas } from "./render/atlas";
import { createMaterials } from "./render/material";
import { Observer } from "./render/observer";
import { Renderer } from "./render/renderer";
import { Viewport } from "./render/viewport";
import { Stream } from "./stream/stream";

const canvas = document.querySelector("canvas")!;

const observer = new Observer(height, canvas.clientWidth / canvas.clientHeight);
const viewport = new Viewport(canvas, observer);
const atlas = new TextureAtlas(registry);
const renderer = new Renderer(viewport.scene, createMaterials(atlas));
const stream = new Stream(chunkbuilder, renderer);

const picker = document.createElement("input");
picker.type = "file";
picker.accept = ".zip,.jar";
Object.assign(picker.style, { position: "fixed", top: "8px", left: "8px", zIndex: "1" });
document.body.append(picker);

picker.onchange = async () => {
    const file = picker.files?.[0];
    if (!file) return;
    const [images, maps] = await Promise.all([loadPackImages([file], registry.slotNames), loadColorMaps([file])]);
    atlas.build(images);
    colormap.set(maps.grass, maps.foliage);
    stream.reset();
}

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
