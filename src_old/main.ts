import { WorldRenderer } from "./rendering/world-rendering";

const renderer = new WorldRenderer();

addEventListener("resize", () => {
    renderer.resize();
})

let last = performance.now(), fps = 60;

function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    fps += (1 / dt - fps) * 0.05;

    renderer.update(dt);
    renderer.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
