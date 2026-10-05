/**
 * The Overworld biome table, transcribed from the wiki's "inland surface biomes" table and its
 * beach / badland / middle / plateau / shattered sub-tables.
 *
 * It is a two-stage lookup, like the game's:
 *   1. ROWS: a (continentalness, erosion, PV) region picks an entry. An entry is either a fixed
 *      biome or a category, optionally restricted by temperature / humidity / weirdness.
 *   2. A category ("middle", "plateau", ...) is a (temperature, humidity, weirdness) table whose
 *      entries are boxes, so merged cells in the wiki's tables are just intervals here.
 *
 * buildSpaces() multiplies the two stages out into one list of boxes per biome, which is what
 * `Biome.space` returns and BiomeMap paints. Biomes like Meadow, which appear in many cells of
 * both stages, therefore never have to be written out by hand.
 *
 * Level indices: T/H = 0..4, C = 0..6 (see CONT), E = 0..6, W = 0 (<0) / 1 (>0), PV = 0..4 (see PVL).
 * Oceans and mushroom fields are NOT in the screenshots; they are filled in at the bottom from
 * memory of the game and are marked as such.
 */
import { BIOME, type BiomeID, type BiomeRegion } from "./biome";
import { CONT, PVL, at, intersect, type Where } from "./region";

const B = BIOME;

type Category = "middle" | "plateau" | "shattered" | "badland" | "beach";
type Target = BiomeID | Category;
/** [what, restriction]. The restriction is one Where, or a list of them meaning "any of these". */
type Entry = readonly [target: Target, where?: Where | readonly Where[]];

// ---------------------------------------------------------------------------------------------
// Stage 2: category tables over (temperature, humidity, weirdness)

interface Cell { where: Where; biome: BiomeID }
const cell = (biome: BiomeID, where: Where): Cell => ({ where, biome });

const BEACH: Cell[] = [
    cell(B.SNOWY_BEACH, { T: 0 }),
    cell(B.BEACH, { T: [1, 3] }),
    cell(B.DESERT, { T: 4 }),
];

const BADLAND: Cell[] = [
    cell(B.BADLANDS, { H: [0, 1], W: 0 }), cell(B.ERODED_BADLANDS, { H: [0, 1], W: 1 }),
    cell(B.BADLANDS, { H: 2 }),
    cell(B.WOODED_BADLANDS, { H: [3, 4] }),
];

const MIDDLE: Cell[] = [
    // T=0
    cell(B.SNOWY_PLAINS, { T: 0, H: 0, W: 0 }), cell(B.ICE_SPIKES, { T: 0, H: 0, W: 1 }),
    cell(B.SNOWY_PLAINS, { T: 0, H: 1 }),
    cell(B.SNOWY_PLAINS, { T: 0, H: 2, W: 0 }), cell(B.SNOWY_TAIGA, { T: 0, H: 2, W: 1 }),
    cell(B.SNOWY_TAIGA, { T: 0, H: 3 }),
    cell(B.TAIGA, { T: 0, H: 4 }),
    // T=1
    cell(B.PLAINS, { T: 1, H: 0, W: 0 }), cell(B.DAPPLED_FOREST, { T: 1, H: 0, W: 1 }),
    cell(B.TAIGA, { T: 1, H: 3 }),
    cell(B.OLD_GROWTH_SPRUCE_TAIGA, { T: 1, H: 4, W: 0 }), cell(B.OLD_GROWTH_PINE_TAIGA, { T: 1, H: 4, W: 1 }),
    // T=1..2 (merged cells)
    cell(B.PLAINS, { T: [1, 2], H: 1 }),
    cell(B.FOREST, { T: [1, 2], H: 2 }),
    // T=2
    cell(B.FLOWER_FOREST, { T: 2, H: 0, W: 0 }), cell(B.SUNFLOWER_PLAINS, { T: 2, H: 0, W: 1 }),
    cell(B.BIRCH_FOREST, { T: 2, H: 3, W: 0 }), cell(B.OLD_GROWTH_BIRCH_FOREST, { T: 2, H: 3, W: 1 }),
    cell(B.DARK_FOREST, { T: 2, H: 4 }),
    // T=3
    cell(B.SAVANNA, { T: 3, H: [0, 1] }),
    cell(B.FOREST, { T: 3, H: 2, W: 0 }), cell(B.PLAINS, { T: 3, H: 2, W: 1 }),
    cell(B.JUNGLE, { T: 3, H: 3, W: 0 }), cell(B.SPARSE_JUNGLE, { T: 3, H: 3, W: 1 }),
    cell(B.JUNGLE, { T: 3, H: 4, W: 0 }), cell(B.BAMBOO_JUNGLE, { T: 3, H: 4, W: 1 }),
    // T=4
    cell(B.DESERT, { T: 4 }),
];

const PLATEAU: Cell[] = [
    // T=0
    cell(B.SNOWY_PLAINS, { T: 0, H: 0, W: 0 }), cell(B.ICE_SPIKES, { T: 0, H: 0, W: 1 }),
    cell(B.SNOWY_PLAINS, { T: 0, H: [1, 2] }),
    cell(B.SNOWY_TAIGA, { T: 0, H: [3, 4] }),
    // T=1
    cell(B.MEADOW, { T: 1, H: 0, W: 0 }), cell(B.CHERRY_GROVE, { T: 1, H: 0, W: 1 }),
    cell(B.MEADOW, { T: 1, H: 1 }),
    cell(B.FOREST, { T: 1, H: 2, W: 0 }), cell(B.MEADOW, { T: 1, H: 2, W: 1 }),
    cell(B.TAIGA, { T: 1, H: 3, W: 0 }), cell(B.MEADOW, { T: 1, H: 3, W: 1 }),
    cell(B.OLD_GROWTH_SPRUCE_TAIGA, { T: 1, H: 4, W: 0 }), cell(B.OLD_GROWTH_PINE_TAIGA, { T: 1, H: 4, W: 1 }),
    // T=2   (H=0..1 is one merged cell)
    cell(B.MEADOW, { T: 2, H: [0, 1], W: 0 }), cell(B.CHERRY_GROVE, { T: 2, H: [0, 1], W: 1 }),
    cell(B.MEADOW, { T: 2, H: 2, W: 0 }), cell(B.FOREST, { T: 2, H: 2, W: 1 }),
    cell(B.MEADOW, { T: 2, H: 3, W: 0 }), cell(B.BIRCH_FOREST, { T: 2, H: 3, W: 1 }),
    cell(B.PALE_GARDEN, { T: 2, H: 4 }),
    // T=3
    cell(B.SAVANNA_PLATEAU, { T: 3, H: [0, 1] }),
    cell(B.FOREST, { T: 3, H: [2, 3] }),
    cell(B.JUNGLE, { T: 3, H: 4 }),
    // T=4
    cell(B.BADLANDS, { T: 4, H: [0, 1], W: 0 }), cell(B.ERODED_BADLANDS, { T: 4, H: [0, 1], W: 1 }),
    cell(B.BADLANDS, { T: 4, H: 2 }),
    cell(B.WOODED_BADLANDS, { T: 4, H: [3, 4] }),
];

const SHATTERED: Cell[] = [
    cell(B.WINDSWEPT_GRAVELLY_HILLS, { T: [0, 1], H: [0, 1] }),
    cell(B.WINDSWEPT_HILLS, { T: [0, 1], H: 2 }),
    cell(B.WINDSWEPT_FOREST, { T: [0, 1], H: [3, 4] }),
    cell(B.WINDSWEPT_HILLS, { T: 2, H: [0, 2] }),
    cell(B.WINDSWEPT_FOREST, { T: 2, H: [3, 4] }),
    cell(B.SAVANNA, { T: 3, H: [0, 1] }),
    cell(B.FOREST, { T: 3, H: 2, W: 0 }), cell(B.PLAINS, { T: 3, H: 2, W: 1 }),
    cell(B.JUNGLE, { T: 3, H: 3, W: 0 }), cell(B.SPARSE_JUNGLE, { T: 3, H: 3, W: 1 }),
    cell(B.JUNGLE, { T: 3, H: 4, W: 0 }), cell(B.BAMBOO_JUNGLE, { T: 3, H: 4, W: 1 }),
    cell(B.DESERT, { T: 4 }),
];

const CATEGORIES: Record<Category, Cell[]> = {
    middle: MIDDLE, plateau: PLATEAU, shattered: SHATTERED, badland: BADLAND, beach: BEACH,
};

// ---------------------------------------------------------------------------------------------
// Stage 1: the big table, one row per merged span of cells

interface Row { at: BiomeRegion; entries: readonly Entry[] }
const row = (where: Where, ...entries: (Entry | readonly Entry[])[]): Row => ({
    at: at(where),
    entries: entries.flatMap(e => (typeof e[0] === "number" || typeof e[0] === "string" ? [e as Entry] : (e as readonly Entry[]))),
});

const { COAST, NEAR_INLAND: NEAR, MID_INLAND: MID, FAR_INLAND: FAR } = CONT;
const { VALLEYS: V, LOW, MID: MIDPV, HIGH, PEAKS } = PVL;

// Groups that repeat across the table
const RIVERS: Entry[] = [[B.FROZEN_RIVER, { T: 0 }], [B.RIVER, { T: [1, 4] }]];
const MIDDLE_OR_BADLAND: Entry[] = [["middle", { T: [0, 3] }], ["badland", { T: 4 }]];
const SLOPES_T0: Entry[] = [[B.SNOWY_SLOPES, { T: 0, H: [0, 1] }], [B.GROVE, { T: 0, H: [2, 4] }]];
const SLOPES_LT3: Entry[] = [[B.SNOWY_SLOPES, { T: [0, 2], H: [0, 1] }], [B.GROVE, { T: [0, 2], H: [2, 4] }]];
const SLOPES_T0_MIDDLE: Entry[] = [...SLOPES_T0, ["middle", { T: [1, 3] }], ["badland", { T: 4 }]];
const SLOPES_T0_PLATEAU: Entry[] = [...SLOPES_T0, ["plateau", { T: [1, 4] }]];
const SLOPES_LT3_PLATEAU: Entry[] = [...SLOPES_LT3, ["plateau", { T: [3, 4] }]];
const PEAKS_SET: Entry[] = [
    [B.JAGGED_PEAKS, { T: [0, 2], W: 0 }], [B.FROZEN_PEAKS, { T: [0, 2], W: 1 }],
    [B.STONY_PEAKS, { T: 3 }], ["badland", { T: 4 }],
];
const SWAMPS: Entry[] = [[B.FROZEN_RIVER, { T: 0 }], [B.SWAMP, { T: [1, 2] }], [B.MANGROVE_SWAMP, { T: [3, 4] }]];
const SWAMPY_MIDDLE: Entry[] = [["middle", { T: 0 }], [B.SWAMP, { T: [1, 2] }], [B.MANGROVE_SWAMP, { T: [3, 4] }]];
const BEACH_OR_MIDDLE: Entry[] = [["beach", { W: 0 }], ["middle", { W: 1 }]];   // "Beach biomes (W<0) / Middle biomes (W>0)"

// E=5 splits on "W<0 OR T=0,1 OR H=4" versus Windswept Savanna (W>0; T=2,3,4; H=0..3)
const NOT_WINDSWEPT: Where[] = [{ W: 0 }, { T: [0, 1] }, { H: 4 }];
const WINDSWEPT: Entry = [B.WINDSWEPT_SAVANNA, { W: 1, T: [2, 4], H: [0, 3] }];
const E5_COAST: Entry[] = [["beach", { W: 0 }], ["middle", [{ W: 1, T: [0, 1] }, { W: 1, H: 4 }]], WINDSWEPT];
const E5_MIDDLE_OR_WS: Entry[] = [["middle", NOT_WINDSWEPT], WINDSWEPT];
const E5_SHATTERED_OR_WS: Entry[] = [["shattered", NOT_WINDSWEPT], WINDSWEPT];

const ROWS: Row[] = [
    // ---- E=0
    row({ E: 0, PV: V, C: [COAST, NEAR] }, RIVERS),
    row({ E: 0, PV: V, C: [MID, FAR] }, MIDDLE_OR_BADLAND),                       // [bo 1] footnote in the wiki: not visible in the screenshot
    row({ E: 0, PV: LOW, C: COAST }, [B.STONY_SHORE]),
    row({ E: 0, PV: LOW, C: NEAR }, MIDDLE_OR_BADLAND),
    row({ E: 0, PV: LOW, C: [MID, FAR] }, SLOPES_T0_MIDDLE),
    row({ E: 0, PV: MIDPV, C: COAST }, [B.STONY_SHORE]),
    row({ E: 0, PV: MIDPV, C: [NEAR, FAR] }, SLOPES_LT3_PLATEAU),
    row({ E: 0, PV: HIGH, C: COAST }, ["middle"]),
    row({ E: 0, PV: HIGH, C: NEAR }, SLOPES_LT3_PLATEAU),
    row({ E: 0, PV: HIGH, C: [MID, FAR] }, PEAKS_SET),
    row({ E: 0, PV: PEAKS, C: [COAST, FAR] }, PEAKS_SET),
    // ---- E=1
    row({ E: 1, PV: V, C: [COAST, NEAR] }, RIVERS),
    row({ E: 1, PV: V, C: [MID, FAR] }, MIDDLE_OR_BADLAND),
    row({ E: 1, PV: LOW, C: COAST }, [B.STONY_SHORE]),
    row({ E: 1, PV: LOW, C: NEAR }, MIDDLE_OR_BADLAND),
    row({ E: 1, PV: LOW, C: [MID, FAR] }, SLOPES_T0_MIDDLE),
    row({ E: 1, PV: MIDPV, C: COAST }, [B.STONY_SHORE]),
    row({ E: 1, PV: MIDPV, C: [NEAR, MID] }, SLOPES_T0_MIDDLE),
    row({ E: 1, PV: MIDPV, C: FAR }, SLOPES_T0_PLATEAU),
    row({ E: 1, PV: HIGH, C: COAST }, ["middle"]),
    row({ E: 1, PV: HIGH, C: NEAR }, SLOPES_T0_MIDDLE),
    row({ E: 1, PV: HIGH, C: [MID, FAR] }, SLOPES_LT3_PLATEAU),
    row({ E: 1, PV: PEAKS, C: [COAST, NEAR] }, SLOPES_T0_MIDDLE),
    row({ E: 1, PV: PEAKS, C: [MID, FAR] }, PEAKS_SET),
    // ---- E=2
    row({ E: 2, PV: V, C: [COAST, FAR] }, RIVERS),
    row({ E: 2, PV: LOW, C: COAST }, [B.STONY_SHORE]),
    row({ E: 2, PV: LOW, C: NEAR }, ["middle"]),
    row({ E: 2, PV: LOW, C: [MID, FAR] }, MIDDLE_OR_BADLAND),
    row({ E: 2, PV: MIDPV, C: COAST }, [B.STONY_SHORE]),
    row({ E: 2, PV: MIDPV, C: NEAR }, ["middle"]),
    row({ E: 2, PV: MIDPV, C: MID }, MIDDLE_OR_BADLAND),
    row({ E: 2, PV: MIDPV, C: FAR }, ["plateau"]),
    row({ E: 2, PV: [HIGH, PEAKS], C: [COAST, NEAR] }, ["middle"]),
    row({ E: 2, PV: [HIGH, PEAKS], C: [MID, FAR] }, ["plateau"]),
    // ---- E=3
    row({ E: 3, PV: V, C: [COAST, FAR] }, RIVERS),
    row({ E: 3, PV: LOW, C: COAST }, ["beach"]),
    row({ E: 3, PV: LOW, C: NEAR }, ["middle"]),
    row({ E: 3, PV: LOW, C: [MID, FAR] }, MIDDLE_OR_BADLAND),
    row({ E: 3, PV: MIDPV, C: [COAST, NEAR] }, ["middle"]),
    row({ E: 3, PV: MIDPV, C: [MID, FAR] }, MIDDLE_OR_BADLAND),
    row({ E: 3, PV: [HIGH, PEAKS], C: [COAST, NEAR] }, ["middle"]),
    row({ E: 3, PV: [HIGH, PEAKS], C: MID }, MIDDLE_OR_BADLAND),
    row({ E: 3, PV: [HIGH, PEAKS], C: FAR }, ["plateau"]),
    // ---- E=4
    row({ E: 4, PV: V, C: [COAST, FAR] }, RIVERS),
    row({ E: 4, PV: LOW, C: COAST }, ["beach"]),
    row({ E: 4, PV: LOW, C: [NEAR, FAR] }, ["middle"]),
    row({ E: 4, PV: MIDPV, C: COAST }, BEACH_OR_MIDDLE),
    row({ E: 4, PV: MIDPV, C: [NEAR, FAR] }, ["middle"]),
    row({ E: 4, PV: [HIGH, PEAKS], C: [COAST, FAR] }, ["middle"]),
    // ---- E=5
    row({ E: 5, PV: V, C: [COAST, FAR] }, RIVERS),
    row({ E: 5, PV: LOW, C: COAST }, E5_COAST),
    row({ E: 5, PV: LOW, C: NEAR }, E5_MIDDLE_OR_WS),
    row({ E: 5, PV: LOW, C: [MID, FAR] }, ["middle"]),
    row({ E: 5, PV: MIDPV, C: COAST }, E5_COAST),
    row({ E: 5, PV: MIDPV, C: NEAR }, E5_MIDDLE_OR_WS),
    row({ E: 5, PV: MIDPV, C: [MID, FAR] }, ["shattered"]),
    row({ E: 5, PV: HIGH, C: [COAST, NEAR] }, E5_MIDDLE_OR_WS),
    row({ E: 5, PV: HIGH, C: [MID, FAR] }, ["shattered"]),
    row({ E: 5, PV: PEAKS, C: [COAST, NEAR] }, E5_SHATTERED_OR_WS),
    row({ E: 5, PV: PEAKS, C: [MID, FAR] }, ["shattered"]),
    // ---- E=6
    row({ E: 6, PV: V, C: COAST }, RIVERS),
    row({ E: 6, PV: V, C: [NEAR, FAR] }, SWAMPS),
    row({ E: 6, PV: LOW, C: COAST }, ["beach"]),
    row({ E: 6, PV: LOW, C: [NEAR, FAR] }, SWAMPY_MIDDLE),
    row({ E: 6, PV: MIDPV, C: COAST }, BEACH_OR_MIDDLE),
    row({ E: 6, PV: MIDPV, C: [NEAR, FAR] }, SWAMPY_MIDDLE),
    row({ E: 6, PV: [HIGH, PEAKS], C: [COAST, FAR] }, ["middle"]),

    // ---- NOT in the screenshots. From memory of the game; check against the wiki's ocean table.
    row({ C: CONT.MUSHROOM_FIELDS }, [B.MUSHROOM_FIELDS]),
    row({ C: CONT.DEEP_OCEAN }, [B.DEEP_FROZEN_OCEAN, { T: 0 }], [B.DEEP_COLD_OCEAN, { T: 1 }], [B.DEEP_OCEAN, { T: 2 }],
        [B.DEEP_LUKEWARM_OCEAN, { T: 3 }], [B.WARM_OCEAN, { T: 4 }]),
    row({ C: CONT.OCEAN }, [B.FROZEN_OCEAN, { T: 0 }], [B.COLD_OCEAN, { T: 1 }], [B.OCEAN, { T: 2 }],
        [B.LUKEWARM_OCEAN, { T: 3 }], [B.WARM_OCEAN, { T: 4 }]),
];

// ---------------------------------------------------------------------------------------------
// Multiply the two stages out

const asList = (w: Where | readonly Where[] | undefined): readonly Where[] =>
    w === undefined ? [{}] : Array.isArray(w) ? (w as readonly Where[]) : [w as Where];

/** Every biome's space: the union of (row region ∩ entry restriction ∩ category-table cell) boxes. */
export function buildSpaces(): Map<BiomeID, BiomeRegion[]> {
    const spaces = new Map<BiomeID, BiomeRegion[]>();
    const add = (id: BiomeID, region: BiomeRegion) => {
        const list = spaces.get(id);
        if (list) list.push(region); else spaces.set(id, [region]);
    };
    for (const r of ROWS) for (const [target, where] of r.entries) for (const w of asList(where)) {
        const base = intersect(r.at, at(w));
        if (!base) continue;
        if (typeof target === "number") { add(target, base); continue; }
        for (const c of CATEGORIES[target]) {
            const region = intersect(base, at(c.where));
            if (region) add(c.biome, region);
        }
    }
    return spaces;
}
