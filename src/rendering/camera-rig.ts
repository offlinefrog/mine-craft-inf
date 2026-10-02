import * as THREE from 'three';

import { CAM_EYE_HEIGHT, CAM_PITCH, CAM_Z, SPEED_ACCEL, SPEED_MAX, SPEED_START } from '../config';

export class CameraRig {
    x = 0;
    speed = SPEED_START;
    private t = 0;

    private cam: THREE.PerspectiveCamera;
    private groundAt: (x: number) => number;

    constructor(cam: THREE.PerspectiveCamera, groundAt: (x: number) => number) {
        this.cam = cam;
        this.groundAt = groundAt;
        cam.rotation.order = 'YXZ';
        cam.rotation.x = CAM_PITCH;
        cam.position.set(0, this.eyeY(0), CAM_Z);
    }

    update(dt: number) {
        this.t += dt;
        this.speed = Math.min(SPEED_MAX, SPEED_START + SPEED_ACCEL * this.t);
        this.x += this.speed * dt;
        this.cam.position.x = this.x;
        this.cam.position.y = this.eyeY(this.x);
        this.cam.rotation.y = 0.05 * Math.sin(this.t * 0.11);
    }

    private eyeY(x: number) {
        const left = Math.floor(x);
        const fraction = x - left;
        return this.groundAt(left) * (1 - fraction) + this.groundAt(left + 1) * fraction + CAM_EYE_HEIGHT;
    }
}
