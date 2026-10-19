import type { Generator } from "../generate/generate";
import { Chunk } from "../world/chunk";
import type { Mesh, Mesher } from "./mesh";

// generates and meshes one chunk, synchronously
export class Builder {
    private readonly scratch = new Chunk();
    private readonly generator: Generator;
    private readonly mesher: Mesher;

    constructor(generator: Generator, mesher: Mesher) {
        this.generator = generator; this.mesher = mesher;
    }

    build(cx: number, cz: number): Mesh | null {
        this.scratch.reset(cx, cz, false);
        this.generator.generate(this.scratch);
        return this.mesher.mesh(this.scratch);
    }
}
