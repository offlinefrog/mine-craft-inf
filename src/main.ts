import * as THREE from "three";
import { ChunkRenderer } from "./rendering/chunk-rendering";
import { CHUNK_DEPTH, CHUNK_SIZE, SEED } from "./config";
import { Context } from "./world-generation/chunk-generation/context";
import { generateChunk } from "./world-generation/chunk-generation/pipeline";
import { meshChunk } from "./rendering/chunk-meshing";
import { CameraRig } from "./rendering/camera-rig";
import type { Chunk } from "./world/chunk";

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0.55, 0.75, 0.95);

const rig = new CameraRig(window.innerWidth, window.innerHeight);

// chunk
const context = new Context(SEED);
const chunkRenderer = new ChunkRenderer();

scene.add(chunkRenderer.group);

const CHUNK_RADIUS = 16;     // temp
function generateVisibleChunks(): Chunk[] {
    const camera = rig.camera;

    const ccx = Math.floor(camera.position.x / CHUNK_SIZE);
    const ccz = Math.floor(camera.position.z / CHUNK_SIZE);

    const chunks: Chunk[] = [];

    for (let cz = ccz; cz <= ccz + CHUNK_DEPTH; cz++) {
        for (let cx = ccx - CHUNK_RADIUS; cx <= ccx + CHUNK_RADIUS; cx++) {
            const chunk = generateChunk(context, cx, cz);
            chunks.push(chunk);
        }
    }

    return chunks;
}

function meshVisibleChunks(chunks: Chunk[]): void {
    for (const chunk of chunks) {
        const chunkMesh = meshChunk(chunk);
        chunkRenderer.add(chunk.key, chunk.cx, chunk.cz, chunkMesh);
    }
}

console.log(`${performance.now()}: generating chunks...`);
const generationStart = performance.now();

const chunks = generateVisibleChunks();

const generationTime = performance.now() - generationStart;
console.log(`${performance.now()}: ${chunks.length} chunks generated in ${generationTime.toFixed(2)} ms!`);

console.log(`${performance.now()}: meshing chunks...`);
const meshingStart = performance.now();

meshVisibleChunks(chunks);

const meshingTime = performance.now() - meshingStart;
console.log(`${performance.now()}: ${chunks.length} chunks meshed in ${meshingTime.toFixed(2)} ms!`)

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    rig.resize(window.innerWidth, window.innerHeight);
})

let last = performance.now(), fps = 60;

function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    fps += (1 / dt - fps) * 0.05;

    rig.update(dt);
    renderer.render(scene, rig.camera);
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
