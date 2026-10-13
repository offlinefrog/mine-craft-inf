// Renderer creates Three.js Mesh objects from the given Mesh out of the provided Materials and adds to the Scene
//  acts as a StreamListener for Stream
//  depending on Mesh data, different Materials can be used for different rendering maps

import * as THREE from "three";

import { State, type Entry, type StreamListener } from "../stream/stream";
import type { GeometryData, Mesh } from "../mesh/mesh";
import type { ChunkMaterials } from "./material";
import { CHUNK_SIZE, UPLOADS_PER_FRAME, VERTEX_SCALE, WORLD_HEIGHT } from "../config";

export class Renderer implements StreamListener {
    private readonly queue: { entry: Entry, mesh: Mesh }[] = [];
    private readonly live = new Map<Entry, THREE.Mesh[]>();

    private readonly scene: THREE.Scene;
    private readonly materials: ChunkMaterials;

    constructor(scene: THREE.Scene, mats: ChunkMaterials) {
        this.scene = scene; this.materials = mats;
    }

    get queued(): number { return this.queue.length; }

    ready(entry: Entry, mesh: Mesh | null) {
        if (mesh && (mesh.opaque || mesh.cutout || mesh.translucent)) this.queue.push({ entry, mesh });
    }

    unload(entry: Entry) {
        const meshes = this.live.get(entry);
        if (!meshes) return;

        for (const m of meshes) {
            this.scene.remove(m);
            m.geometry.dispose();
        }

        this.live.delete(entry);
    }

    // flush meshes and make meshes
    flush(maxChunks = UPLOADS_PER_FRAME) {
        while (maxChunks > 0 && this.queue.length > 0) {
            const { entry, mesh } = this.queue.shift()!;
            if (entry.state === State.Unloaded) continue;
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
    }

    private makeMesh(
        entry: Entry,
        data: GeometryData,
        material: THREE.Material,
        bounds: THREE.Box3,
        renderOrder: number
    ): THREE.Mesh {
        const geometry = new THREE.BufferGeometry();
        for (const [name, a] of Object.entries(data.attributes)) {
            geometry.setAttribute(name, new THREE.BufferAttribute(a.array, a.itemSize, a.normalized ?? false));
        }
        geometry.setIndex(new THREE.BufferAttribute(data.index, 1));

        geometry.boundingBox = bounds.clone();
        geometry.boundingSphere = bounds.getBoundingSphere(new THREE.Sphere());

        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = renderOrder;
        mesh.position.set(entry.cx * CHUNK_SIZE, 0, entry.cz * CHUNK_SIZE);
        mesh.scale.setScalar(1 / VERTEX_SCALE);

        mesh.updateMatrix();
        mesh.updateMatrixWorld(true);
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldAutoUpdate = false;
        
        return mesh;
    }
}
