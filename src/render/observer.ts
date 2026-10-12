// Observer holds the Three.js PerspectveCamera and updates its View accordingly

import * as THREE from "three";

import { CAM_FAR, CAM_HEIGHT, CAM_NEAR, CAM_SPEED, FOV, HEIGHT_SMOOTHING } from "../config";
import type { View } from "../stream/stream";

export class Observer {
    readonly camera: THREE.PerspectiveCamera;
    readonly view: View;

    constructor(aspect: number, startX = 0, startZ = 0) {
        this.camera = new THREE.PerspectiveCamera(FOV, aspect, CAM_NEAR, CAM_FAR);
        this.camera.position.set(startX, height(startX, startZ) + CAM_HEIGHT, startZ);
        this.view = { x: startX, z: startZ, fov: FOV, aspect };
    }

    update(dt: number) {
        const p = this.camera.position;
        p.x += CAM_SPEED * dt;

        const target = this.height(p.x, p.z) + CAM_HEIGHT;
        p.y += (target - p.y) * (1 - Math.exp(-HEIGHT_SMOOTHING * dt));

        this.view.x = p.x; this.view.z = p.z;
    }

    resize(aspect: number) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.view.aspect = aspect;
    }
}
