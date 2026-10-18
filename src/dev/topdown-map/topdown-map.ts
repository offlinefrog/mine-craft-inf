import { CHUNK_SIZE, SEA_LEVEL, SEED } from "../../config";
import { createContext } from "../../generate/context";
import { Generator } from "../../generate/generate";
import { BiomeRegistry } from "../../world/biomes/biome-registry";
import { paintChunk, type MapMode, type RenderOptions } from "./map-render";
import { TileCache } from "./map-tiles";

const FRAME_BUDGET_MS = 12; // generation + painting per animation frame
const MODE_LABEL: Record<MapMode, string> = { biome: "1 Biome", height: "2 Height", both: "3 Both" };

// state
const options: RenderOptions = { mode: "biome", blend: 0.5, hillshade: true };
let chunksAcross = 64;      // zoom: chunks across viewport
let minCX = 0, minCZ = 0;   // world chunk at top-left of view

const generator = new Generator(createContext(SEED));
const cache = new TileCache(generator);
const registry = new BiomeRegistry();

// DOM
document.body.style.cssText = `
    margin: 0;
    overflow: hidden;
    background: #111;
    color: #eee;
    font: 13px monospace
`;

const header = document.createElement("div");
header.style.cssText = `
    height: 40px;
    box-sizing: border-box;
    padding: 8px 12px;
    background: #222;
    display: flex;
    gap: 8px;
    align-items: center
`;
document.body.appendChild(header);

const buttons = new Map<MapMode, HTMLButtonElement>();
for (const mode of Object.keys(MODE_LABEL) as MapMode[]) {
    const b = document.createElement("button");
    b.textContent = MODE_LABEL[mode];
    b.style.cssText = `
        font: inherit;
        padding: 2px 8px;
        cursor: pointer
    `;
    b.onclick = () => setMode(mode);
    header.appendChild(b);
    buttons.set(mode, b);
}

const status = document.createElement("span");
status.style.marginLeft = "8px";
header.appendChild(status);

const viewport = document.createElement("div");
viewport.style.cssText = `
    width: 100%;
    height: calc(100dvh - 40px);
    overflow: hidden;
    position: relative
`;
document.body.appendChild(viewport);

const canvas = document.createElement("canvas");
canvas.style.display = "block";
viewport.appendChild(canvas);
const ctx = canvas.getContext("2d")!;

const tooltip = document.createElement("div");
tooltip.style.cssText = `
    position: absolute;
    display: none;
    pointer-events: none;
    padding: 6px 8px;
    background: #222;
    border: 1px solid #555;
    white-space: nowrap
`;
viewport.appendChild(tooltip);

// view geometry (1px per screen pixel canvas)
let width = 1, height = 1;
let scale = 1;          // screen pixels per block
let cols = 1, rows = 1; // chunks covering view
let image = ctx.createImageData(1, 1);
let px32 = new Uint32Array(image.data.buffer);

function resize() {
    width = Math.max(1, Math.floor(viewport.clientWidth));
    height = Math.max(1, Math.floor(viewport.clientHeight));

    canvas.width = width;
    canvas.height = height;

    image = ctx.createImageData(width, height);
    px32 = new Uint32Array(image.data.buffer);

    scale = width / (chunksAcross * CHUNK_SIZE);
    cols = chunksAcross;
    rows = Math.ceil(height / (CHUNK_SIZE * scale));

    render();
}

// progressive rendering
let token = 0;

// paints every visible chunk center first: lazy generation with cached chunks
function render() {
    const mine = ++token;
    const t0 = performance.now();
    const genStart = cache.generated;

    const order: [number, number][] =[];
    for (let cj = 0; cj < rows; cj++) for (let ci = 0; ci < cols; ci++) order.push([ci, cj]);
    
    const mx = (cols - 1) / 2, mz = (rows - 1) / 2;
    order.sort((a, b) => Math.hypot(a[0] - mx, a[1] - mz) - Math.hypot(b[0] - mx, b[1] - mz));

    let next = 0;
    const step = () => {
        if (mine !== token) return; // superseeded by pan, zoom, mode change

        const frameStart = performance.now();
        let dx0 = width, dy0 = height, dx1 = 0, dy1 = 0;

        while (next < order.length && performance.now() - frameStart < FRAME_BUDGET_MS) {
            const [ci, cj] = order[next++]!;
            const rect = paintChunk(
                px32, width, height, 
                cache.get(minCX + ci, minCZ + cj),
                ci, cj, scale, options
            );
            if (rect) {
                dx0 = Math.min(dx0, rect[0]);
                dy0 = Math.min(dy0, rect[1]);
                dx1 = Math.max(dx1, rect[2]);
                dy1 = Math.max(dy1, rect[3]);
            }
        }

        if (dx1 > dx0) ctx.putImageData(image, 0, 0, dx0, dy0, dx1 - dx0, dy1 - dy0);

        updateStatus(
            next < order.length
            ? `${next}/${order.length} chunks...`
            : `${(performance.now() - t0).toFixed(0)} ms, ${cache.generated - genStart} generated`
        );
        if (next < order.length) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function updateStatus(progress: string) {
    const blend = options.mode === "both" ? ` | blend ${(options.blend * 100).toFixed(0)}%` : "";
    const shade = options.mode === "biome" ? "" : ` | shade ${options.hillshade ? "on" : "off"}`;
    status.textContent =
        `chunks (${minCX}, ${minCZ})→(${minCX + cols - 1}, ${minCZ + rows - 1})${blend}${shade}` +
        ` | cached ${cache.size} | ${progress}`;
}

function setMode(mode: MapMode) {
    options.mode = mode;
    buttons.forEach((b, m) => (b.style.background = m === mode ? "#58a" : ""));
    render();
}

// input
window.addEventListener("resize", (() => {
    let timer = 0;
    return () => { clearTimeout(timer); timer = window.setTimeout(resize, 100); };
})());

window.addEventListener("keydown", (e: KeyboardEvent) => {
    switch (e.key) {
        case "1": setMode("biome"); break;
        case "2": setMode("height"); break;
        case "3": setMode("both"); break;
        case "h": options.hillshade = !options.hillshade; render(); break;
        case "[": options.blend = Math.max(0, options.blend - 0.1); render(); break;
        case "]": options.blend = Math.min(1, options.blend + 0.1); render(); break;
        case "-": chunksAcross = Math.min(512, chunksAcross * 2); resize(); break;
        case "=": chunksAcross = Math.max(8, Math.floor(chunksAcross / 2)); resize(); break;
        case "0": minCX = 0; minCZ = 0; render(); break;
        case "ArrowLeft": minCX -= Math.max(1, cols >> 1); render(); break;
        case "ArrowRight": minCX += Math.max(1, cols >> 1); render(); break;
        case "ArrowUp": minCZ -= Math.max(1, rows >> 1); render(); break;
        case "ArrowDown": minCZ += Math.max(1, rows >> 1); render(); break;
        default: return;
    }
    e.preventDefault();
});

viewport.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = Math.floor(e.clientX - rect.left), pz = Math.floor(e.clientY - rect.top);
    if (px < 0 || pz < 0 || px >= width || pz >= height) { tooltip.style.display = "none"; return; }

    const bx = Math.floor(px / scale), bz = Math.floor(pz / scale); // block offsets from view origin
    const ci = Math.floor(bx / CHUNK_SIZE), cj = Math.floor(bz / CHUNK_SIZE);
    const lx = bx - ci * CHUNK_SIZE, lz = bz - cj * CHUNK_SIZE;
    const cx = minCX + ci, cz = minCZ + cj;

    const tile = cache.get(cx, cz);
    const i = (lx + 1) * (CHUNK_SIZE + 2) + (lz + 1);
    const y = tile.heights[i]!;
    const name = registry.index(tile.biomes[i]!).name;

    tooltip.textContent = 
        `${name} | y ${y} (${y >= SEA_LEVEL ? "+" : ""}${y - SEA_LEVEL} vs sea)` +
        ` | world (${cx * CHUNK_SIZE + lx}, ${cz * CHUNK_SIZE + lz})` +
        ` | chunk (${cx}, ${cz})` + 
        ` | block (${lx}, ${lz})`;
    tooltip.style.display = "block";
    tooltip.style.left = `${px + 12}px`;
    tooltip.style.top = `${pz + 12}px`;
});
viewport.addEventListener("mouseleave", () => { tooltip.style.display = "none"; });

setMode("biome");
resize();
