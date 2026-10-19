// Renderer turns finished Meshes into Three.js Objects and removes on unload

import * as THREE from "three";

import type { Entry, StreamListener } from "../stream/stream";
import { VERTEX_SCALE, type GeometryData, type Mesh } from "../build/mesh";
import type { ChunkMaterials } from "./materials";
import { CHUNK_SIZE, UPLOAD_VERTEX_BUDGET } from "../config";

const vertices = (g: GeometryData | null): number => (g ? g.attributes.position!.array.length / 3 : 0);
const meshVertices = (m: Mesh): number => vertices(m.opaque) + vertices(m.cutout) + vertices(m.translucent);

// frees CPU copy when passed to GPU (chunks are static). unsafe for wireframes, raycast against chunks, or recovery from lost WebGL context
function releaseAfterUpload(attr: THREE.BufferAttribute): THREE.BufferAttribute {
    return attr.onUpload(() => { (attr as unknown as { array: unknown }).array = null; });
}

export class Renderer implements StreamListener {
    private readonly queue = new Map<Entry, Mesh>();        // finished, waiting for upload, oldest first
    private readonly live = new Map<Entry, THREE.Mesh[]>(); // in scene

    private readonly scene: THREE.Scene;
    private readonly materials: ChunkMaterials;

    constructor(scene: THREE.Scene, mats: ChunkMaterials) {
        this.scene = scene; this.materials = mats;
    }

    get queued(): number { return this.queue.size; }
    get drawn(): number { return this.live.size; }

    ready(entry: Entry, mesh: Mesh | null) {
        if (mesh) this.queue.set(entry, mesh); // mesher returns null when nothing is visible
    }

    unload(entry: Entry) { // releases mesh array objects immediately
        this.queue.delete(entry);
        const objects = this.live.get(entry);
        if (!objects) return;

        for (const o of objects) {
            this.scene.remove(o);
            o.geometry.dispose(); // materials are shared (not disposed here)
        }

        this.live.delete(entry);
    }

    // adds queued meshes to scene until vertex budget is spent (at least one)
    flush(vertexBudget = UPLOAD_VERTEX_BUDGET) {
        let budget = vertexBudget;
        for (const [entry, mesh] of this.queue) {
            const cost = meshVertices(mesh);
            
            if (budget < vertexBudget && cost > budget) break;
            
            this.queue.delete(entry);
            this.add(entry, mesh);
            budget -= cost;
        }
        /**
        while (maxChunks > 0 && this.queue.length > 0) {
            const { entry, mesh } = this.queue.shift()!;
            if (entry.state === EntryState.Unloaded) continue;
            maxChunks--;

            const S = VERTEX_SCALE;
            const bounds = new THREE.Box3(
                new THREE.Vector3(0, (mesh.yMin ?? 0) * S, 0),
                new THREE.Vector3(CHUNK_SIZE * S, (mesh.yMax ?? WORLD_HEIGHT) * S, CHUNK_SIZE * S)
            );
            const parts: Array<[GeometryData | null, THREE.Material, number]> = [
                [mesh.opaque, this.materials.opaque, 0],
                [mesh.cutout, this.materials.cutout, 0],
                [mesh.translucent, this.materials.translucent, 1]
            ];
            const meshes: THREE.Mesh[] = [];
            
            for (const [data, material, order] of parts) {
                if (data) meshes.push(this.makeMesh(entry, data, material, bounds, order));
            }
            for (const m of meshes) this.scene.add(m);
            this.live.set(entry, meshes);
        }
        */
    }

    dispose() {
        for (const entry of [...this.live.keys()]) this.unload(entry);
        this.queue.clear();
    }

    private add(entry: Entry, mesh: Mesh) {
        const S = VERTEX_SCALE;

        const halfXZ = (CHUNK_SIZE * S) / 2;
        const halfY = ((mesh.yMax - mesh.yMin) * S) / 2;
        
        const sphere = new THREE.Sphere(
            new THREE.Vector3(halfXZ, mesh.yMin * S + halfY, halfXZ),
            Math.hypot(halfXZ, halfY, halfXZ),
        );

        const layers: [GeometryData | null, THREE.Material, number][] = [
            [mesh.opaque, this.materials.opaque, 0],
            [mesh.cutout, this.materials.cutout, 0],
            [mesh.translucent, this.materials.translucent, 1],
        ];
        
        const objects: THREE.Mesh[] = [];
        for (const [data, material, order] of layers) {
            if (data) objects.push(this.makeMesh(entry, data, material, sphere, order));
        }

        for (const o of objects) this.scene.add(o);
        this.live.set(entry, objects);
    }

    private makeMesh(
        entry: Entry,
        data: GeometryData,
        material: THREE.Material,
        sphere: THREE.Sphere,
        order: number
    ): THREE.Mesh {
        const geometry = new THREE.BufferGeometry();
        for (const [name, a] of Object.entries(data.attributes)) {
            geometry.setAttribute(name, releaseAfterUpload(new THREE.BufferAttribute(a.array, a.itemSize, a.normalized ?? false)));
        }
        geometry.setIndex(releaseAfterUpload(new THREE.BufferAttribute(data.index, 1)));
        geometry.boundingSphere = sphere;

        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = order;
        mesh.position.set(entry.cx * CHUNK_SIZE, 0, entry.cz * CHUNK_SIZE);
        mesh.scale.setScalar(1 / VERTEX_SCALE);

        mesh.updateMatrix();
        mesh.updateMatrixWorld(true);
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldAutoUpdate = false;
        
        return mesh;
    }
}
