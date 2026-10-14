import * as THREE from "three";

import type { TextureAtlas } from "./atlas";

export interface ChunkMaterials {
    opaque: THREE.MeshBasicMaterial;
    cutout: THREE.MeshBasicMaterial;
    translucent: THREE.MeshBasicMaterial;
}

export function createMaterials(atlas: TextureAtlas): ChunkMaterials {
    const base = { map: atlas.texture, vertexColors: true };
    const opaque = new THREE.MeshBasicMaterial(base);
    const cutout = new THREE.MeshBasicMaterial({ ...base, alphaTest: 0.5, side: THREE.DoubleSide });
    const translucent = new THREE.MeshBasicMaterial({ ...base, transparent: true, depthWrite: false });

    atlas.rebuild((texture) => {
        for (const m of [opaque, cutout, translucent]) {
            m.map = texture;
            m.needsUpdate = true;
        }
    })

    return { opaque, cutout, translucent };
}
