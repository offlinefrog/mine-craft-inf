import { newClimateSample } from "../generate/source/climate-source";
import { newTerrainShape } from "../generate/source/terrain-source";
import { WORLD_HEIGHT } from "../config";
import type { Context } from "../generate/context";

export function makeSurfaceQuery(ctx: Context, step = 2) {
    const s = newClimateSample(), shape = newTerrainShape();
    const reach = 96;

    return (wx: number, wz: number): number => {
        ctx.climate.sample(wx, wz, s)
        ctx.terrain.shape(s, shape);

        let y = Math.min(WORLD_HEIGHT - 1, Math.ceil(shape.offset + reach));
        while (y > 0 && ctx.terrain.density(wx, y, wz, shape) <= 0) y -= step;

        if (y + 1 < WORLD_HEIGHT && ctx.terrain.density(wx, y + 1, wz, shape) > 0) y++;
        
        return Math.max(y + 1, ctx.terrain.seaLevel);
    };
}
