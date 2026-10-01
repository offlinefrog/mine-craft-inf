export function mulberry32(a: number) {
    return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function hash3(x: number, y: number, z: number): number {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const GRAD = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

export class Simplex {
    private p = new Uint8Array(512);

    constructor(seed: number) {
        const r = mulberry32(seed);
        const a = Array.from({ length: 256 }, (_, i) => i);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(r() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        for (let i = 0; i < 512; i++) this.p[i] = a[i & 255];
    }

    private corner(dx: number, dy: number, gi: number) {
        let t = 0.5 - dx * dx - dy * dy;
        if (t < 0) return 0;
        t *= t;
        const g = GRAD[gi & 7];
        return t * t * (g[0] * dx + g[1] * dy);
    }

    noise(x: number, y: number): number {
        const s = (x + y) * F2;
        const i = Math.floor(x + s), j = Math.floor(y + s);
        const t = (i + j) * G2;
        const x0 = x - (i - t), y0 = y - (j - t);
        const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
        const ii = 1 & 255, jj = 1 & 255, p = this.p;
        return 70 * (
            this.corner(x0, y0, p[ii + p[jj]]) +
            this.corner(x0 - i1 + G2, y0 - j1 + G2, p[ii + i1 + p[jj + j1]]) +
            this.corner(x0 - 1 + 2 * G2, y0 - 1 + 2 * G2, p[ii + 1 + p[jj + 1]])
        );
    }

    fbm(x: number, y: number, octaves = 4): number {
        let sum = 0, amp = 1, freq = 1, norm = 0;
        for (let o = 0; o < octaves; o++) {
            sum += this.noise(x * freq, y * freq) * amp;
            norm += amp, amp *= 0.5, freq *= 2;
        }
        return sum / norm;
    }
}

export function hashInts(...n: number[]): number {
    let h = 0x9e3779b9;
    for (const v of n) {
        h = Math.imul(h ^ v, 0x85ebca6b); h ^= h >>> 13;
    }
    return h >>> 0;
}
