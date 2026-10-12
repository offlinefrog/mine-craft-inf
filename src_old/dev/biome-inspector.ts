import * as THREE from "three";
import type { Chunk } from "../world/chunk";
import { CHUNK_SIZE, WORLD_HEIGHT } from "../config";

interface ChunkEntry {
    chunk: Chunk;
    mesh: THREE.Object3D;
}

export class BiomeInspector {
    private readonly raycaster = new THREE.Raycaster();
    private readonly mouse = new THREE.Vector2();

    private readonly camera: THREE.Camera;
    private readonly canvas: HTMLCanvasElement;
    private readonly chunks: ChunkEntry[];

    private readonly label: HTMLDivElement;

    constructor(
        camera: THREE.Camera,
        canvas: HTMLCanvasElement,
        chunks: ChunkEntry[],
    ) {
        this.camera = camera;
        this.canvas = canvas;
        this.chunks = chunks;

        this.label = document.createElement("div");

        Object.assign(this.label.style, {
            position: "fixed",
            left: "10px",
            top: "10px",
            padding: "6px 10px",
            background: "rgba(0, 0, 0, 0.75)",
            color: "white",
            fontFamily: "monospace",
            fontSize: "14px",
            pointerEvents: "none",
            display: "none",
            zIndex: "1000",
        });

        document.body.appendChild(this.label);

        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("mouseleave", this.hide);
    }

    dispose(): void {
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mouseleave", this.hide);
        this.label.remove();
    }

    private readonly onMouseMove = (event: MouseEvent): void => {
        const rect = this.canvas.getBoundingClientRect();

        this.mouse.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;

        this.mouse.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const objects = this.chunks.map(entry => entry.mesh);
        const hits = this.raycaster.intersectObjects(objects, true);

        if (hits.length === 0) {
            this.hide();
            return;
        }

        const hit = hits[0];

        const entry = this.findChunk(hit.object);

        if (!entry || !hit.point) {
            this.hide();
            return;
        }

        this.show(entry.chunk, hit.point, event.clientX, event.clientY);
    };

    private findChunk(object: THREE.Object3D): ChunkEntry | undefined {
        let current: THREE.Object3D | null = object;

        while (current) {
            const entry = this.chunks.find(
                entry => entry.mesh === current,
            );

            if (entry) {
                return entry;
            }

            current = current.parent;
        }

        return undefined;
    }

    private show(
        chunk: Chunk,
        point: THREE.Vector3,
        mouseX: number,
        mouseY: number,
    ): void {
        // Convert world coordinates into chunk-local coordinates.
        const localX = Math.floor(point.x - chunk.cx * CHUNK_SIZE);
        const localZ = Math.floor(point.z - chunk.cz * CHUNK_SIZE);
        const y = Math.floor(point.y);

        if (
            localX < 0 || localX >= CHUNK_SIZE ||
            localZ < 0 || localZ >= CHUNK_SIZE ||
            y < 0 || y >= WORLD_HEIGHT
        ) {
            this.hide();
            return;
        }

        const biomeId = chunk.biomes[localZ * CHUNK_SIZE + localX];

        this.label.textContent =
            `Biome: ${biomeId}  ` +
            `Block: (${localX}, ${y}, ${localZ})  ` +
            `Chunk: (${chunk.cx}, ${chunk.cz})`;

        this.label.style.left = `${mouseX + 12}px`;
        this.label.style.top = `${mouseY + 12}px`;
        this.label.style.display = "block";
    }

    private readonly hide = (): void => {
        this.label.style.display = "none";
    };
}
