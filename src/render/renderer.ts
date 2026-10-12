// Renderer creates Three.js Mesh objects from the given Mesh out of the provided Materials and adds to the Scene
//  acts as a StreamListener for Stream
//  depending on Mesh data, different Materials can be used for different rendering maps

import * as THREE from "three";

import { type Entry, type StreamListener } from "../stream/stream";
import type { Mesh } from "../build/mesh";

export class Renderer implements StreamListener {
    private readonly queue: { entry: Entry, mesh: Mesh }[] = [];
    private readonly live = new Map<Entry, THREE.Mesh>();

    private readonly scene: THREE.Scene;
    private readonly materials: Materials;

    constructor(scene: THREE.Scene, mats: Materials) {
        this.scene = scene; this.materials = mats;
    }

    get queued(): number { return this.queue.length; }

    ready(entry: Entry, mesh: Mesh | null) {
        if (mesh) this.queue.push({ entry, mesh });
    }

    unload(entry: Entry) {
        const mesh = this.live.get(entry);
        if (!mesh) return;

        this.scene.remove(mesh);
        mesh.geometry.dispose();

        this.live.delete(entry);
    }

    // flush meshes and make meshes
}
