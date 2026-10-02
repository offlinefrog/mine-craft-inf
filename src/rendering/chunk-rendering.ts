import * as THREE from 'three';

import { CHUNK_SIZE } from '../config';

import type { ChunkMeshes, MeshData } from '../meshing/chunk-meshing';

import { ChunkMaterials, type ShaderHook } from './chunk-materials';
import type { TextureAtlas } from './texture-atlas';

export class ChunkRenderer {
    readonly group = new THREE.Group();
    private meshes = new Map<string, THREE.Mesh[]>();
    private mats: ChunkMaterials;

    constructor(atlas: TextureAtlas, hooks?: (ShaderHook | undefined)[]) {
        this.mats = new ChunkMaterials(atlas, hooks);
    }

    count() {
        return this.meshes.size;
    }

    keys() {
        return this.meshes.keys();
    }

    update(seconds:number) {
        this.mats.update(seconds);
    }

    setLight(c: THREE.Color) {
        this.mats.setLight(c);
    }

    add(key: string, cx: number, cz: number, parts: ChunkMeshes) {
        const list: THREE.Mesh[] = [];
        
        parts.forEach((d: MeshData | null, layer) => {
            if (!d) return;
            
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.BufferAttribute(d.pos, 3));        // 1/16-block fixed point
            g.setAttribute('color', new THREE.BufferAttribute(d.col, 4, true));     // RGBA8
            g.setAttribute('uv', new THREE.BufferAttribute(d.uv, 2, true));         // normalized 16-bit
            g.setIndex(new THREE.BufferAttribute(d.idx, 1));
            g.computeBoundingSphere();

            const mesh = new THREE.Mesh(g, this.mats.list[layer]);
            mesh.scale.setScalar(1 / 16);
            mesh.position.set(cx * CHUNK_SIZE, 0, cz * CHUNK_SIZE);     // local vertices, distance-independent precision
            mesh.matrixAutoUpdate = false;                              // one-time matrix computation
            mesh.updateMatrix();

            this.group.add(mesh);
            list.push(mesh);
        });

        this.meshes.set(key, list);
    }

    remove(key: string) {
        for (const m of this.meshes.get(key) ?? []) {
            this.group.remove(m);
            m.geometry.dispose();
        }
        this.meshes.delete(key);
    }
}
