// Viewport manages the Observer on the Three.js scene

import * as THREE from "three";

import { SKY } from "../config";
import type { Observer } from "./observer";

export class Viewport {
    readonly scene = new THREE.Scene();
    private readonly gl: THREE.WebGLRenderer;

    private readonly canvas: HTMLCanvasElement;
    private readonly observer: Observer;

    constructor(canvas: HTMLCanvasElement, observer: Observer) {
        this.gl = new THREE.WebGLRenderer({ canvas, antialias: false });
        this.scene.background = new THREE.Color(SKY);

        this.resize();
        window.addEventListener("resize", this.resize);

        this.canvas = canvas;
        this.observer = observer;
    }

    private readonly resize = (): void => {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;

        if (w === 0 || h === 0) return;

        this.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.gl.setSize(w, h, false);
        this.observer.resize(w / h);
    }

    render() {
        this.gl.render(this.scene, this.observer.camera);
    }

    dispose() {
        window.removeEventListener("resize", this.resize);
        this.gl.dispose();
    }
}
