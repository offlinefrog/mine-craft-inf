import * as THREE from "three";
import { CameraRig } from "./camera-rig";
import { ChunkRenderer } from "./chunk-rendering";

const SKY = 0x9fc8e8;

export class WorldRenderer {
    readonly gl = new THREE.WebGLRenderer({ antialias: true });
    readonly scene = new THREE.Scene();
    readonly rig = new CameraRig(innerWidth, innerHeight);
    
    readonly chunks = new ChunkRenderer();

    constructor() {
        this.gl.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.gl.setSize(innerWidth, innerHeight);
        this.gl.outputColorSpace = THREE.LinearSRGBColorSpace;      // TBD

        document.body.style.margin = '0';                           // TBD
        document.body.appendChild(this.gl.domElement);

        this.scene.background = new THREE.Color(SKY);
        // fog eventually

        this.scene.add(this.chunks.group);
    }

    update(dt: number) {
        this.rig.update(dt);
        //this.chunks.update()
    }

    resize() {
        this.rig.resize(innerWidth, innerHeight);
        this.gl.setSize(innerWidth, innerHeight);
    }

    render() {
        this.gl.render(this.scene, this.rig.camera);
    }
}
