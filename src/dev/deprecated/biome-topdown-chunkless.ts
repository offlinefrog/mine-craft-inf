import { CHUNK_SIZE } from "../../config";
import { newClimateSample } from "../../generate/climate-source";
import { createContext } from "../../generate/context";
import { BiomeRegistry } from "../../world/biomes/biome-registry";

const CHUNKS_PER_SCREEN_X = 250;
const BLOCK_SIZE = window.screen.availWidth / (CHUNKS_PER_SCREEN_X * CHUNK_SIZE);
const BAND_ROWS = 32;

const BIOME_COLORS: readonly string[] = [
    "#000000", // 0: unused

    "#315B91", //  1 ocean
    "#183B70", //  2 deep_ocean
    "#3D9EAD", //  3 warm_ocean
    "#398B9F", //  4 lukewarm_ocean
    "#28677F", //  5 deep_lukewarm_ocean
    "#416F9F", //  6 cold_ocean
    "#2D507D", //  7 deep_cold_ocean
    "#A5C9D8", //  8 frozen_ocean
    "#668DAA", //  9 deep_frozen_ocean
    "#756B91", // 10 mushroom_fields

    "#8A8F91", // 11 jagged_peaks
    "#D7E5EC", // 12 frozen_peaks
    "#A6A39A", // 13 stony_peaks
    "#8DBB69", // 14 meadow
    "#E6A7C5", // 15 cherry_grove
    "#78966B", // 16 grove
    "#C5D5D8", // 17 snowy_slopes
    "#9BA58A", // 18 windswept_hills
    "#A99D87", // 19 windswept_gravelly_hills
    "#607F57", // 20 windswept_forest

    "#39734A", // 21 forest
    "#65A65D", // 22 flower_forest
    "#567C46", // 23 taiga
    "#6C7650", // 24 old_growth_pine_taiga
    "#52714D", // 25 old_growth_spruce_taiga
    "#B8C9C1", // 26 snowy_taiga
    "#83A95F", // 27 birch_forest
    "#9EBB70", // 28 old_growth_birch_forest
    "#294D37", // 29 dark_forest
    "#777D69", // 30 pale_garden
    "#32965A", // 31 jungle
    "#78A65B", // 32 sparse_jungle
    "#23805A", // 33 bamboo_jungle
    "#5C8A4B", // 34 dappled_forest

    "#4C9CB2", // 35 river
    "#B4D9E8", // 36 frozen_river
    "#657D45", // 37 swamp
    "#477C52", // 38 mangrove_swamp
    "#D8C58B", // 39 beach
    "#E4E8DF", // 40 snowy_beach
    "#9B9D98", // 41 stony_shore

    "#9BCB69", // 42 plains
    "#D8D76B", // 43 sunflower_plains
    "#D5DEDB", // 44 snowy_plains
    "#C1DCE7", // 45 ice_spikes

    "#D9B66F", // 46 desert
    "#B5AC55", // 47 savanna
    "#9E914A", // 48 savanna_plateau
    "#C18C52", // 49 windswept_savanna
    "#B96F45", // 50 badlands
    "#C28A51", // 51 wooded_badlands
    "#D49A58", // 52 eroded_badlands
];

const PALETTE = new Uint32Array(256).fill(0xffff00ff);
BIOME_COLORS.forEach((hex, i) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    PALETTE[i] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
});

document.body.style.cssText = `
    margin: 0;
    overflow: hidden;
    background: #111;
    color: #eee;
    font: 13px monospace;
`;

const header = document.createElement("div");
header.style.cssText = `
    height: 40px;
    box-sizing: border-box;
    padding: 12px;
    background: #222;
`;
document.body.appendChild(header);

const viewport = document.createElement("div");
viewport.style.cssText = `
    width: 100%;
    height: calc(100dvh - 40px);
    overflow: hidden;
    position: relative;
`;
document.body.appendChild(viewport);

const canvas = document.createElement("canvas");
canvas.style.cssText = `
    display: block;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
`;
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
    white-space: nowrap;
`;
document.body.appendChild(tooltip);

const context = createContext(1);
const biomes = new BiomeRegistry();
const sample = newClimateSample();

let minCX = 0
let minCZ = 0;
let chunksX = 1;
let chunksZ = 1;
let width = 1;
let height = 1;
let blocksX = CHUNK_SIZE;
let blocksZ = CHUNK_SIZE;
let colBlock = new Int32Array(1);
let image = ctx.createImageData(width, height);

const blockOf = (p: number): number => Math.floor(p / BLOCK_SIZE);

function resizeMap() {
    width = Math.max(1, Math.floor(viewport.clientWidth));
    height = Math.max(1, Math.floor(viewport.clientHeight));

    blocksX = Math.ceil(width / BLOCK_SIZE);
    blocksZ = Math.ceil(height / BLOCK_SIZE);
    chunksX = Math.ceil(blocksX / CHUNK_SIZE);
    chunksZ = Math.ceil(blocksZ / CHUNK_SIZE);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    colBlock = new Int32Array(width);
    for (let px = 0; px < width; px++) colBlock[px] = blockOf(px);

    image = ctx.createImageData(width, height);
    renderScreen();
}

let renderToken = 0;

function renderScreen() {
    const token = ++renderToken;
    const t0 = performance.now();
    const px32 = new Uint32Array(image.data.buffer);
    const x0 = minCX * CHUNK_SIZE;
    const z0 = minCZ * CHUNK_SIZE;
    const { climate, biomes: source } = context;
    let pz = 0;

    const step = () => {
        if (token !== renderToken) return;

        const end = Math.min(pz + BAND_ROWS, height);
        for (let row = pz; row < end; row++) {
            const wz = z0 + blockOf(row);
            const base = row * width;
            for (let px = 0; px < width; px++) {
                climate.sample(x0 + colBlock[px]!, wz, sample);
                px32[base + px] = PALETTE[source.lookup(sample)]!;
            }
        }

        ctx.putImageData(image, 0, 0, 0, pz, width, end - pz);
        pz = end;

        if (pz < height) requestAnimationFrame(step);
        else updateHeader(performance.now() - t0);
    };

    requestAnimationFrame(step);
}

function updateHeader(ms: number) {
    header.textContent =
        `Chunks: (${minCX}, ${minCZ}) → ` +
        `(${minCX + chunksX - 1}, ${minCZ + chunksZ - 1})` +
        `: ${chunksX * chunksZ} chunks, ${blocksX * blocksZ} blocks` +
        ` | Render: ${ms.toFixed(0)} ms, (${width * height} samples)`;
}

let resizeTimer = 0;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeMap, 100);
});

window.addEventListener("keydown", (event: KeyboardEvent) => {
    let handled = true;

    switch (event.key) {
        case "ArrowLeft":
            minCX -= chunksX;
            break;
        case "ArrowRight":
            minCX += chunksX;
            break;
        case "ArrowUp":
            minCZ -= chunksZ;
            break;
        case "ArrowDown":
            minCZ += chunksZ;
            break;
        default:
            handled = false;
    }

    if (handled) {
        event.preventDefault();
        renderScreen();
    }
});

const div = (a: number, b: number): number => Math.floor(a / b);

viewport.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();

    const px = Math.floor(event.clientX - rect.left);
    const pz = Math.floor(event.clientY - rect.top);

    if (px < 0 || pz < 0 || px >= width || pz >= height) {
        tooltip.style.display = "none";
        return;
    }

    const wx = minCX * CHUNK_SIZE + blockOf(px);
    const wz = minCZ * CHUNK_SIZE + blockOf(pz);
    const cx = div(wx, CHUNK_SIZE);
    const cz = div(wz, CHUNK_SIZE);

    context.climate.sample(wx, wz, sample);
    const biomeName = biomes.index(context.biomes.lookup(sample)).name;

    tooltip.textContent =
        `Biome: ${biomeName}` + 
        ` | Chunk: (${cx}, ${cz})` +
        ` | Block: (${wx - cx * CHUNK_SIZE}, ${wz - cz * CHUNK_SIZE})`;
    tooltip.style.display = "block";
    tooltip.style.left = `${event.clientX - rect.left + 12}px`;
    tooltip.style.top = `${event.clientY - rect.top + 12}px`
});

viewport.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
});

resizeMap();
