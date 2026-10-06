import * as THREE from "three";
import type { ChunkMesh } from "./chunk-meshing";
import { CHUNK_SIZE } from "../config";

export class ChunkRenderer {
    readonly group = new THREE.Group();

    private meshes = new Map<string, THREE.Mesh>();
    private material = new THREE.MeshBasicMaterial({ vertexColors: true });

    // dev purposes
    getMesh(key: string): THREE.Object3D | undefined {
        return this.meshes.get(key);
    }

    add(key: string, cx: number, cz: number, data: ChunkMesh): void {
        if (this.meshes.has(key)) return;

        const mesh = new THREE.Mesh(this.create(data), this.material);
        
        mesh.position.set(cx * CHUNK_SIZE, 0, cz * CHUNK_SIZE);
        mesh.frustumCulled = true;
        
        this.group.add(mesh);
        this.meshes.set(key, mesh);
    }

    remove(key: string): void {
        const mesh = this.meshes.get(key);
        if (!mesh) return;
        
        this.group.remove(mesh);
        mesh.geometry.dispose();
        this.meshes.delete(key);
    }

    private create(data: ChunkMesh): THREE.BufferGeometry {
        const geo = new THREE.BufferGeometry();

        if (data.indices.length === 0) {
            return geo;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
        geo.setIndex(new THREE.BufferAttribute(data.indices, 1));
        geo.computeBoundingSphere();
        geo.computeBoundingBox();

        return geo;
    }
}
