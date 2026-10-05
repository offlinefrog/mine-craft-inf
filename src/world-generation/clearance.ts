import { CAMERA_Y } from "../config";
import { Spline, type SplinePoint } from "../core/spline";
import type { TerrainShape } from "./terrain-sample";

export class StraightRoute {
    readonly z: number;

    constructor(z: number = 0) {
        this.z = z;
    }

    distance (_wz: number, wz: number): number {
        return Math.abs(wz - this.z);
    }

    at(s: number): { x: number; z: number } {
        return { x: s, z: this.z };
    }
}

export interface ClearanceConfig {
    cameraY: number;
    routeZ: number;
    ceiling: SplinePoint[];
    noiseScale: SplinePoint[];
    minBias: SplinePoint[];
    blend: number;
}

export const DEFAULT_CLEARANCE_CONFIG: ClearanceConfig = {
  cameraY: CAMERA_Y,
  routeZ: 0,

  ceiling: [[0, -3], [24, -3], [60, 2], [100, 10], [150, 55], [220, 120], [400, 300], [800, 700]],
  noiseScale: [[0, 0.25], [40, 0.25], [160, 1]],
  minBias: [[0, 0.1], [40, 0.1], [160, 0]],
  blend: 6,
}

const smoothMin = (a: number, b: number, k: number): number => {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.min(a, b) - (h * h * k) / 4;
}

export class Clearance {
    readonly route: StraightRoute;
    readonly cameraY: number;
    private readonly ceiling: Spline;
    private readonly noiseScale: Spline;
    private readonly minBias: Spline;
    private readonly blend: number;

    constructor(config: ClearanceConfig = DEFAULT_CLEARANCE_CONFIG) {
        this.route = new StraightRoute(config.routeZ);
        this.cameraY = config.cameraY;
        this.ceiling = new Spline(config.ceiling);
        this.noiseScale = new Spline(config.noiseScale);
        this.minBias = new Spline(config.minBias);
        this.blend = config.blend;
    }

    apply(wx: number, wz: number, shape: TerrainShape): TerrainShape {
        const d = this.route.distance(wx, wz);
        shape.baseHeight = smoothMin(shape.baseHeight, this.cameraY + this.ceiling.eval(d), this.blend);
        shape.noiseScale = this.noiseScale.eval(d);
        shape.bias = Math.max(shape.bias, this.minBias.eval(d));
        return shape;
    }
}
