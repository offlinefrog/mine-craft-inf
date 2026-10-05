import { Spline, type SplinePoint } from "../core/spline";
import { SEA_LEVEL } from "../world/chunk";
import type { TerrainShape } from "./terrain";

/*
 * View clearance for a camera that travels at one fixed height along a straight line.
 *
 * Terrain near the camera must stay below it or it walls off the view; distant mountains can be as
 * tall as they like, because far away they only fill the sky. The limit therefore grows with the
 * distance from the camera's path: a flat ceiling just under the camera close to the path, rising
 * steeper and steeper outward until it is above the natural terrain and stops mattering. Because it
 * depends only on distance to the path, it holds whichever way the camera looks (ahead or sideways).
 *
 * The path is the line z = routeZ, travelled toward +x ("to the right" for a camera facing -z). It is part
 * of the world definition and never depends on where the camera is right now, so a chunk is still a pure
 * function of (seed, coordinates): generation order never matters, saved chunks stay valid, and far
 * chunks can be generated in the background with no knowledge of the camera. It is applied on top of the
 * natural terrain (TerrainSampler.shape) and can be switched off.
 */

/** A straight path along +x at z = `z`. */
export class StraightRoute {
  readonly z: number;

  constructor(z: number = 0) {
    this.z = z;
  }

  /** How far (blocks) the column at (wx, wz) is from the path. */
  distance(_wx: number, wz: number): number {
    return Math.abs(wz - this.z);
  }

  /** World position of the camera after travelling `s` blocks along the path (s = 0 is x = 0). */
  pointAt(s: number): { x: number; z: number } {
    return { x: s, z: this.z };
  }
}

export interface ClearanceConfig {
  /** The camera's fixed eye height (absolute y). */
  cameraY: number;
  /** z of the straight path the camera travels along (toward +x). */
  routeZ: number;
  /** Distance from the path -> highest ground allowed there, in blocks relative to cameraY. */
  ceiling: SplinePoint[];
  /** Distance from the path -> strength of the 3D noise (1 = full). Low near the path so no overhangs poke above the camera. */
  noiseStrength: SplinePoint[];
  /**
   * Distance from the path -> the weakest squeeze allowed (density per block). A weak squeeze lets even reduced
   * noise reach several blocks; raising it near the path keeps the ground flat.
   */
  minBias: SplinePoint[];
  /** Width (blocks) of the smooth transition where the ceiling meets the natural terrain. */
  blend: number;
}

export const DEFAULT_CLEARANCE_CONFIG: ClearanceConfig = {
  cameraY: SEA_LEVEL + 14,
  routeZ: 0,
  // Flat just below the camera out to 24 blocks, then rising: +2 at 60, +10 at 100, +55 at 150, +120 at 220.
  // Seen from the camera that is 2 degrees at 60 blocks, 6 at 100, then about 20 at 150 and 29 at 220: close
  // terrain stays under the line of sight, while mountains from ~150 blocks out keep their full height.
  ceiling: [[0, -3], [24, -3], [60, 2], [100, 10], [150, 55], [220, 120], [400, 300], [800, 700]],
  noiseStrength: [[0, 0.25], [40, 0.25], [160, 1]],
  minBias: [[0, 0.1], [40, 0.1], [160, 0]],
  blend: 6,
};

/** Smooth minimum: like Math.min, but rounds the crease where a and b cross, over a width k. */
const smoothMin = (a: number, b: number, k: number): number => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - (h * h * k) / 4;
};

export class Clearance {
  readonly route: StraightRoute;
  readonly cameraY: number;
  private readonly ceiling: Spline;
  private readonly noiseStrength: Spline;
  private readonly minBias: Spline;
  private readonly blend: number;

  constructor(config: ClearanceConfig = DEFAULT_CLEARANCE_CONFIG) {
    this.route = new StraightRoute(config.routeZ);
    this.cameraY = config.cameraY;
    this.ceiling = new Spline(config.ceiling);
    this.noiseStrength = new Spline(config.noiseStrength);
    this.minBias = new Spline(config.minBias);
    this.blend = config.blend;
  }

  /** Limit a column's natural terrain shape by its distance from the path. Mutates and returns `shape`. */
  apply(wx: number, wz: number, shape: TerrainShape): TerrainShape {
    const d = this.route.distance(wx, wz);
    shape.baseHeight = smoothMin(shape.baseHeight, this.cameraY + this.ceiling.eval(d), this.blend);
    shape.noiseScale = this.noiseStrength.eval(d);
    shape.bias = Math.max(shape.bias, this.minBias.eval(d));
    return shape;
  }
}
