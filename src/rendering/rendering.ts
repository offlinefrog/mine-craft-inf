import * as THREE from 'three';

import { FAR, FOG_FAR, FOG_NEAR } from '../config';

const SKY = 0x9fc8e8;

export class Renderer {
    readonly gl = new THREE.WebGLRenderer({ antialias: true });
    readonly scene = new THREE.Scene();
    readonly camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, FAR);

    constructor() {
        this.gl.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.gl.setSize(innerWidth, innerHeight);
        
        document.body.appendChild(this.gl.domElement);

        this.scene.background = new THREE.Color(SKY);
        this.scene.fog = new THREE.Fog(SKY, FOG_NEAR, FOG_FAR);

        addEventListener('resize', () => {
            this.camera.aspect = innerWidth / innerHeight;
            this.camera.updateProjectionMatrix();
            this.gl.setSize(innerWidth, innerHeight);
        });
    }

    render() {
        this.gl.render(this.scene, this.camera);
    }
}
