import * as THREE from 'three';
import { Chunk } from '../world/Chunk';
import type { ChunkMeshes, MeshData } from './ChunkMesher';

export class ChunkRenderer {
    readonly group = new THREE.Group();
    private meshes = new Map<Chunk, THREE.Mesh[]>();
    private solidMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    private waterMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.65, depthWrite: false});

    add(ch: Chunk, m: ChunkMeshes) {
        const list: THREE.Mesh[] = [];
        const mk = (d: MeshData | null, mat: THREE.Material) => {
            if (!d) return;
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.BufferAttribute(d.pos, 3));
            g.setAttribute('color', new THREE.BufferAttribute(d.col, 3));
            g.setIndex(new THREE.BufferAttribute(d.idx, 1));
            g.computeBoundingSphere();
            
            const mesh = new THREE.Mesh(g, mat);
            this.group.add(mesh);
            list.push(mesh);
        };

        mk(m.solid, this.solidMat);
        mk(m.water, this.waterMat);
        this.meshes.set(ch, list);
    }

    remove(ch: Chunk) {
        for (const m of this.meshes.get(ch) ?? []) {
            this.group.remove(m); m.geometry.dispose();
        }
        this.meshes.delete(ch);
    }
}