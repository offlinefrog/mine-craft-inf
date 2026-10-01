import { CS, HEIGHT, SEA } from '../config';
import { B } from '../lib/blocks';
import { Chunk } from '../world/Chunk';
import { hashInts, mulberry32 } from '../lib/noise';
import { TerrainGenerator } from './TerrainGenerator';

type SetBlock = (x: number, y: number, z: number, id: B) => void;
type Rng = () => number;

interface StructureDef {
    cell: number;
    radius: number;
    chance: Record<string, number>;
    build(r: Rng, x: number, y: number, z: number, set: SetBlock): void;
}