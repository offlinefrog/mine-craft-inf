import * as THREE from "three";

import { CHUNK_SIZE, SEED } from "../config";
import { Context } from "../world-generation/chunk-generation/context";
import { generateChunk } from "../world-generation/chunk-generation/pipeline";
import { meshChunk } from "../rendering/chunk-meshing";
import { ChunkRenderer } from "../rendering/chunk-rendering";
import type { Chunk } from "../world/chunk";

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

console.log(`${performance.now()}: generating chunks...`);

const generationStart = performance.now();

const chunks: {
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

        chunks.push({
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
