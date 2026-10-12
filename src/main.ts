import { MAX_FRAME_DT, PRIME_RADIUS } from "./config";
import { Observer } from "./render/observer";
import { Viewport } from "./render/viewport";
import { Stream } from "./stream/stream";

const canvas = document.querySelector("canvas")!;

const observer = new Observer(height, canvas.clientWidth / canvas.clientHeight);
const viewport = new Viewport(canvas, observer);
// const chunkrenderer
const stream = new Stream(chunkbuilder, chunkrenderer);

let last = performance.now();
let primed = false;

function frame(now: number) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME_DT);
    last = now;

    if (primed) observer.update(dt);
    stream.update(observer.view);
    // chunkrenderer.flush();
    if (!primed) {
        primed = stream.primed(observer.view, PRIME_RADIUS) // && chunkrenderer.queued === 0;
    }
    viewport.render();
}

requestAnimationFrame(frame);
