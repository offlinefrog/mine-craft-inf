import * as THREE from 'three';

import { CAM_PITCH, CAM_Y, CAM_Z, SPEED_ACCEL, SPEED_MAX, SPEED_START } from '../config';

export class CameraRig {
    x = 0;
    speed = SPEED_START;
    private t = 0;

    private cam: THREE.PerspectiveCamera;

    constructor(cam: THREE.PerspectiveCamera) {
        this.cam = cam;
        cam.rotation.order = 'YXZ';
        cam.rotation.x = CAM_PITCH;
        cam.position.set(0, CAM_Y, CAM_Z);
    }

    update(dt: number) {
        this.t += dt;
        this.speed = Math.min(SPEED_MAX, SPEED_START + SPEED_ACCEL * this.t);
        this.x += this.speed * dt;
        this.cam.position.x = this.x;
        this.cam.rotation.y = 0.05 * Math.sin(this.t * 0.11);
    }
}
