import * as THREE from "three";

import { CHUNK_SIZE, SEED, WORLD_HEIGHT } from "../config";
import { Context } from "../world-generation/chunk-generation/context";
import { generateChunk } from "../world-generation/chunk-generation/pipeline";
import { meshChunk } from "../rendering/chunk-meshing";
import { ChunkRenderer } from "../rendering/chunk-rendering";
import type { Chunk } from "../world/chunk";
import { BIOME_NAMES } from "../world/biomes/biome";

// Field dimensions in chunks.
const CHUNK_WIDTH = 16;
const CHUNK_DEPTH = 32;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0.55, 0.75, 0.95);

// Chunk generation
const context = new Context(SEED);
const chunkRenderer = new ChunkRenderer();

scene.add(chunkRenderer.group);

const chunks: Chunk[] = [];

console.log(`${performance.now()}: generating chunks...`);

const generationStart = performance.now();

const chunkdata: {
    chunk: Chunk;
    mesh: THREE.Object3D;
}[] = [];

for (let cz = 0; cz < CHUNK_DEPTH; cz++) {
    for (let cx = 0; cx < CHUNK_WIDTH; cx++) {
        const chunk = generateChunk(context, cx, cz);
        const chunkMesh = meshChunk(chunk);

        chunkRenderer.add(
            chunk.key,
            chunk.cx,
            chunk.cz,
            chunkMesh,
        );

        chunks.push(chunk);

        chunkdata.push({
            chunk,
            mesh: chunkRenderer.getMesh(chunk.key)!,
        });
    }
}

const generationTime = performance.now() - generationStart;

console.log(
    `Generated and meshed ${CHUNK_WIDTH * CHUNK_DEPTH} chunks ` +
    `in ${generationTime.toFixed(2)} ms`,
);

// Camera
const fieldWidth = CHUNK_WIDTH * CHUNK_SIZE;
const fieldDepth = CHUNK_DEPTH * CHUNK_SIZE;

const centerX = fieldWidth / 2;
const centerZ = fieldDepth / 2;

const padding = CHUNK_SIZE * 2;

const aspect = window.innerWidth / window.innerHeight;

const viewWidth = fieldWidth + padding * 2;
const viewHeight = viewWidth / aspect;

const camera = new THREE.OrthographicCamera(
    -viewWidth / 2,
    viewWidth / 2,
    viewHeight / 2,
    -viewHeight / 2,
    0.1,
    2000,
);

camera.position.set(
    centerX,
    500,
    centerZ,
);

camera.lookAt(
    centerX,
    0,
    centerZ,
);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const biomeLabel = document.createElement("div");

Object.assign(biomeLabel.style, {
    position: "fixed",
    padding: "6px 10px",
    background: "rgba(0, 0, 0, 0.75)",
    color: "white",
    fontFamily: "monospace",
    fontSize: "14px",
    pointerEvents: "none",
    display: "none",
    zIndex: "1000",
});

document.body.appendChild(biomeLabel);

function findChunkAtPoint(point: THREE.Vector3): Chunk | undefined {
    const cx = Math.floor(point.x / CHUNK_SIZE);
    const cz = Math.floor(point.z / CHUNK_SIZE);

    return chunks.find(
        chunk => chunk.cx === cx && chunk.cz === cz
    );
}

function updateBiomeLabel(event: MouseEvent): void {
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersections = raycaster.intersectObjects(
        chunkRenderer.group.children,
        true
    );

    if (intersections.length === 0) {
        biomeLabel.style.display = "none";
        return;
    }

    const intersection = intersections[0];

    if (!intersection.point) {
        biomeLabel.style.display = "none";
        return;
    }

    const point = intersection.point;

    const chunk = findChunkAtPoint(point);

    if (!chunk) {
        biomeLabel.style.display = "none";
        return;
    }

    const localX = Math.floor(point.x) - chunk.cx * CHUNK_SIZE;
    const localZ = Math.floor(point.z) - chunk.cz * CHUNK_SIZE;

    if (localX < 0 || localX >= CHUNK_SIZE || localZ < 0 || localZ >= CHUNK_SIZE) {
        biomeLabel.style.display = "none";
        return;
    }

    const biomeIndex = localZ * CHUNK_SIZE + localX;
    const biomeID = chunk.biomes[biomeIndex];
    const blockY = Math.floor(point.y);
    
    if (blockY < 0 || blockY >= WORLD_HEIGHT) {
        biomeLabel.style.display = "none";
        return;
    }

    biomeLabel.textContent =
        `Biome: ${BIOME_NAMES[biomeID]} | ` +
        `Block: (${localX}, ${blockY}, ${localZ}) | ` +
        `Chunk: (${chunk.cx}, ${chunk.cz})`;

    biomeLabel.style.left = `${event.clientX + 12}px`;
    biomeLabel.style.top = `${event.clientY + 12}px`;
    biomeLabel.style.display = "block";
}

renderer.domElement.addEventListener(
    "mousemove", updateBiomeLabel
);

renderer.domElement.addEventListener(
    "mouseleave", () => { biomeLabel.style.display = "none"; }
);

// Resize
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);

    const aspect = window.innerWidth / window.innerHeight;
    const viewHeight = viewWidth / aspect;

    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;

    camera.updateProjectionMatrix();
});

// Render
function frame(): void {
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
