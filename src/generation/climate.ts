import { H_SCALE } from "../config";
import { Simplex } from "../noise";

// climate parameters in [-1, 1] for terrain height and biome
export interface Climate {
    temperature: number;
    humidity: number;
    continent: number;
    erosion: number
    pv: number
}

const bind = (v: number) => Math.max(-1, Math.min(1, v));

export class ClimateMap {
    private n: Simplex[];
    private warp: Simplex[];
    
    constructor(seed: number) {
        this.n = [11, 23, 37, 51, 67].map((o) => new Simplex(seed + o));
        this.warp = [91, 97].map((o) => new Simplex(seed + o));
    }

    sample(x: number, z: number): Climate {
        x /= H_SCALE; z /= H_SCALE;

        const px = x + this.warp[0].fbm(x * 0.004, z * 0.004, 2) * 90;
        const pz = z + this.warp[1].fbm(x * 0.004 + 300, z * 0.004, 2) * 90;
        const [t, h, c, e, p] = this.n;
        
        return {
            temperature: bind(t.fbm(px * 0.0018, pz * 0.0018, 2) * 2.2),
            humidity: bind(h.fbm(px * 0.0018 + 700, pz * 0.0018, 2) * 2.2),
            continent: bind(c.fbm(px * 0.0022, pz * 0.0022, 3) * 2.2 + 0.25), // +0.25: land bias
            erosion: bind(e.fbm(px * 0.003, pz * 0.003, 3) * 2.2),            // high = eroded/flat, low = rugged
            pv: p.noise(px * 0.01, pz * 0.01),                                // ridge (peaks and valleys) lines
        };
    }
}
