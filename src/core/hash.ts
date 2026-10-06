// 32-bit integer mixing
function mix(h: number, v: number): number {
    h = Math.imul(h ^ v, 0x9e3779b1);
    h ^= h >>> 15;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;

    return h | 0;
}

// seeded, 3D hash to uint32
export function hash(seed: number, a = 0, b = 0, c = 0): number {
    let h = mix(seed | 0, a | 0);
    h = mix(h, b | 0);
    h = mix(h, c | 0);

    return h >>> 0;
}
