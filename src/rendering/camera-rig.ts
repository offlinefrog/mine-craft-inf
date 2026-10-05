import * as THREE from "three";
import { CAMERA_FOV, CAMERA_SPEED, CAMERA_START, CAMERA_Y, CAMERA_Z, CHUNK_SIZE, WORLD_DEPTH } from "../config";

export class CameraRig {
    x = 0;

    readonly camera: THREE.PerspectiveCamera;

    constructor(width: number, height: number) {
        this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.1, WORLD_DEPTH);
        this.camera.position.set(CAMERA_START, CAMERA_Y, CAMERA_Z);
        this.camera.lookAt(CHUNK_SIZE / 2, CAMERA_Y, CHUNK_SIZE / 2);
        this.camera.updateMatrixWorld();
    }

    update(dt: number): void {
        this.x += CAMERA_SPEED * dt;
        this.camera.position.x = this.x;
    }

    resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}

