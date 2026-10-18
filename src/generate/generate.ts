import type { Chunk } from "../world/chunk";
import { biomes } from "./biomes-stage";
import type { Context, Stage } from "./context";
import { noise } from "./noise-stage";

const STAGES: Stage[] = [biomes, noise];

export class Generator {
    private readonly stages: readonly Stage[];
    private readonly ctx: Context;

    constructor(ctx: Context, stages: readonly Stage[] = STAGES) {
        for (let i = 1; i < stages.length; i++) {
            if (stages[i].status <= stages[i - 1].status) {
                throw new Error("stages must be in strictly increasing status order");
            }
        }
        
        this.ctx = ctx;
        this.stages = stages;
    }

    generate(chunk: Chunk) {
        for (const stage of this.stages) {
            if (stage.status <= chunk.status) continue;
            stage.run(this.ctx, chunk);
            chunk.status = stage.status;
        }
    }
}
