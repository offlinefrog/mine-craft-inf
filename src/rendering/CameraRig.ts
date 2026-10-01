import * as THREE from 'three';
import { CAM_Z, CS, SEA, SPEED } from '../config';
import { TerrainGenerator } from '../generation/TerrainGenerator';

export class CameraRig {
    x = 0;
    private y: number;

    private cam: THREE.PerspectiveCamera;
    private terrain: TerrainGenerator;

    constructor(cam: THREE.PerspectiveCamera, terrain: TerrainGenerator) {
        this.cam = cam; this.terrain = terrain;
        this.y = this.targetY();
        this.cam.rotation.x = -0.32;
    }

    private targetY() {
        return Math.max(SEA, this.terrain.column(this.x, -CS).h) + 22;
    }

    update(dt: number) {
        this.x += SPEED * dt;
        this.y += (this.targetY() - this.y) * Math.min(1, dt * 1.5);
        this.cam.position.set(this.x, this.y, CAM_Z);
    }
}