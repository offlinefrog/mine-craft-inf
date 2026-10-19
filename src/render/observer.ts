// Observer owns the Three.js PerspectveCamera: moves +X at fixed Z, follows terrain, and looks towards -Z

import * as THREE from "three";

import { CAM_FAR, FOCUS_DISTANCE, FOCUS_Y, CAM_HEIGHT, CAM_LOOKAHEAD, CAM_LOOKBEHIND, CAM_NEAR, SAMPLE_STEP, CAM_SPEED, TAU_DOWN, TAU_UP, FOV, MIN_CLEARANCE } from "../config";

export interface View {
    x: number;
    z: number;
    fov: number;
    aspect: number;
}

export type SurfaceQuery = (wx: number, wz: number) => number;

class SurfaceProfile {
    private readonly tags: Float64Array;
    private readonly values: Float64Array;
    private readonly slots: number;
    private readonly surfaceAt: SurfaceQuery;
    private readonly z: number;

    constructor(surfaceAt: SurfaceQuery, z: number) {
        this.slots = Math.ceil((CAM_LOOKBEHIND + CAM_LOOKAHEAD) / SAMPLE_STEP) + 3;
        this.tags = new Float64Array(this.slots).fill(NaN);
        this.values = new Float64Array(this.slots);
        this.surfaceAt = surfaceAt;
        this.z = z;
    }

    private at(i: number): number {
        const s = ((i % this.slots) + this.slots) % this.slots;
        if (this.tags[s] !== i) {
            this.tags[s] = i;
            this.values[s] = this.surfaceAt(i * SAMPLE_STEP, this.z);
        }
        return this.values[s]!;
    }

    max(x: number): number {
        const lo = Math.floor((x - CAM_LOOKBEHIND) / SAMPLE_STEP);
        const hi = Math.ceil((x + CAM_LOOKAHEAD) / SAMPLE_STEP);
        let top = -Infinity;
        for (let i = lo; i <= hi; i++) top = Math.max(top, this.at(i));
        return top;
    }
}

export class Observer {
    readonly camera: THREE.PerspectiveCamera;
    readonly view: View;

    private readonly surfaceAt: SurfaceQuery;
    private readonly profile: SurfaceProfile;
    private x: number;
    private y: number;
    private readonly z: number;

    constructor(aspect: number, surfaceAt: SurfaceQuery, startX = 0, startZ = 0) {
        this.camera = new THREE.PerspectiveCamera(FOV, aspect, CAM_NEAR, CAM_FAR);
        this.view = { x: startX, z: startZ, fov: FOV, aspect };
        this.surfaceAt = surfaceAt;
        this.profile = new SurfaceProfile(surfaceAt, startZ);

        this.x = startX;
        this.z = startZ;
        this.y = this.profile.max(startX) + CAM_HEIGHT;

        this.apply();
    }

    update(dt: number) {
        this.x += CAM_SPEED * dt;

        const target = this.profile.max(this.x) + CAM_HEIGHT;
        const tau = target > this.y ? TAU_UP : TAU_DOWN;
        this.y += (target - this.y) * (1 - Math.exp(-dt / tau));

        this.y = Math.max(this.y, this.surfaceAt(this.x, this.z) + MIN_CLEARANCE);

        this.apply();
    }

    resize(aspect: number) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.view.aspect = aspect;
    }

    private apply() {
        this.camera.position.set(this.x, this.y, this.z);

        this.camera.lookAt(this.x, FOCUS_Y, this.z - FOCUS_DISTANCE);
        this.view.x = this.x;
        this.view.z = this.z;
    }
}