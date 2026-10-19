import { Generator } from "../../generate/generate";
import type { BlockID } from "../../world/blocks/blocks";
import { CHUNK_SIZE } from "../../config";
import { createContext } from "../../generate/context";
import { Chunk } from "../../world/chunk";
import { BiomeRegistry } from "../../world/biomes/biome-registry";

const CHUNKS_PER_SCREEN_X = 250;
const BLOCK_SIZE = window.screen.availWidth / (CHUNKS_PER_SCREEN_X * CHUNK_SIZE);

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

type RGB = [number, number, number];

const colorCache = new Map<BlockID, RGB>();

function getColor(id: BlockID): RGB {
    const cached = colorCache.get(id);
    if (cached) return cached;

    const hex = BIOME_COLORS[id] ?? "#FF00FF";
    const color: RGB = [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];

    colorCache.set(id, color);
    return color;
}

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

const context = createContext(12345);
const generator = new Generator(context);
const chunks = new Map<string, Chunk>();

function getChunk(cx: number, cz: number): Chunk {
    const key = `${cx},${cz}`;
    let chunk = chunks.get(key);

    if (!chunk) {
        chunk = new Chunk(cx, cz);
        generator.generate(chunk);
        chunks.set(key, chunk);
    }

    return chunk;
}

let minCX = 0
let minCZ = 0;
let chunksX = 1;
let chunksZ = 1;
let worldWidth = CHUNK_SIZE;
let worldHeight = CHUNK_SIZE;
let image = ctx.createImageData(worldWidth, worldHeight);

function resizeMap() {
    worldWidth = Math.ceil(viewport.clientWidth / BLOCK_SIZE);
    worldHeight = Math.ceil(viewport.clientHeight / BLOCK_SIZE);

    chunksX = Math.ceil(worldWidth / CHUNK_SIZE);
    chunksZ = Math.ceil(worldHeight / CHUNK_SIZE);

    canvas.width = worldWidth;
    canvas.height = worldHeight;

    canvas.style.width = `${worldWidth * BLOCK_SIZE}px`;
    canvas.style.height = `${worldHeight * BLOCK_SIZE}px`;

    image = ctx.createImageData(worldWidth, worldHeight);
    renderScreen();
}

function renderScreen() {
    const pixels = image.data;

    for (let px = 0; px < worldWidth; px++) {
        for (let pz = 0; pz < worldHeight; pz++) {
            const cx = minCX + Math.floor(px / CHUNK_SIZE);
            const cz = minCZ + Math.floor(pz / CHUNK_SIZE);
            const x = px % CHUNK_SIZE;
            const z = pz % CHUNK_SIZE;

            const chunk = getChunk(cx, cz);
            const biomeID = chunk.biome(x, z);
            const [r, g, b] = getColor(biomeID);

            const i = (pz * worldWidth + px) * 4;
            pixels[i] = r;
            pixels[i + 1] = g;
            pixels[i + 2] = b;
            pixels[i + 3] = 255;
        }
    }

    ctx.putImageData(image, 0, 0);

    header.textContent =
        `Chunks: (${minCX}, ${minCZ}) → ` +
        `(${minCX + chunksX - 1}, ${minCZ + chunksZ - 1})` +
        `: ${chunksX * chunksZ} chunks, ${worldWidth * worldHeight / 16} blocks` +
        ` | Block size: ${BLOCK_SIZE.toFixed(2)}px` +
        ` | Cached: ${chunks.size}`;

}

window.addEventListener("resize", resizeMap);

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

const biomes = new BiomeRegistry();

viewport.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();

    const px = Math.floor((event.clientX - rect.left) / BLOCK_SIZE);
    const pz = Math.floor((event.clientY - rect.top) / BLOCK_SIZE);

    if (px < 0 || pz < 0 || px >= worldWidth || pz >= worldHeight) {
        tooltip.style.display = "none";
        return;
    }

    const cx = minCX + Math.floor(px / CHUNK_SIZE);
    const cz = minCZ + Math.floor(pz / CHUNK_SIZE);
    const x = px % CHUNK_SIZE;
    const z = pz % CHUNK_SIZE;

    const chunk = getChunk(cx, cz);
    const biomeName = biomes.index(chunk.biome(x, z)).name;

    tooltip.textContent =
        `Biome: ${biomeName} | ` + 
        `Chunk: (${cx}, ${cz}) | ` +
        `Block: (${x}, ${z})`;
    tooltip.style.display = "block";
    tooltip.style.left = `${event.clientX - rect.left + 12}px`;
    tooltip.style.top = `${event.clientY - rect.top + 12}px`
});

viewport.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
});

resizeMap();
