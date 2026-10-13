// rules from https://minecraft.wiki/w/World_generation#Biomes

import { TEMPERATURE as T, HUMIDITY as H, CONTINENTALNESS as C, EROSION as E, WEIRDNESS as W, PEAKSVALLEYS as PV } from "../climate";
import { and, byLevel, category, rule, thTable, type Box, type Category, type Cell, type Rule } from "./rules";

const DESERT_ROW: readonly Cell[] = Array(5).fill("desert");
const BADLANDS_ROW: readonly Cell[] = [
    ["badlands", "eroded_badlands"], ["badlands", "eroded_badlands"],
    "badlands", "wooded_badlands", "wooded_badlands"
];
const WINDSWEPT_ROW: readonly Cell[] = [
    "windswept_gravelly_hills", "windswept_gravelly_hills", "windswept_hills", "windswept_forest", "windswept_forest"
];

const oceans = [
    rule("mushroom_fields", { continentalness: C.Mushroom }),
    ...byLevel(
        "temperature", { continentalness: C.Ocean },
        ["frozen_ocean", "cold_ocean", "ocean", "lukewarm_ocean", "warm_ocean"]
    ),
    ...byLevel(
        "temperature", { continentalness: C.DeepOcean },
        ["deep_frozen_ocean", "deep_cold_ocean", "deep_ocean", "deep_lukewarm_ocean", "warm_ocean"]
    )
];

const beach = category(
    byLevel("temperature", {}, ["snowy_beach", "beach", "beach", "beach", "desert"])
);

const badlands = category(
    byLevel("humidity", {}, BADLANDS_ROW)
);

const middle = category(thTable({}, [
    [["snowy_plains", "ice_spikes"],        "snowy_plains", ["snowy_plains", "snowy_taiga"], "snowy_taiga",                               "taiga"],
    [["plains", "dappled_forest"],          "plains",       "forest",                        "taiga",                                     ["old_growth_spruce_taiga", "old_growth_pine_taiga"]],
    [["flower_forest", "sunflower_plains"], "plains",       "forest",                        ["birch_forest", "old_growth_birch_forest"], "dark_forest"],
    ["savanna",                             "savanna",      ["forest", "plains"],            ["jungle", "sparse_jungle"],                 ["jungle", "bamboo_jungle"]],
    DESERT_ROW
]));

const plateau = category(thTable({}, [
    [["snowy_plains", "ice_spikes"], "snowy_plains",             "snowy_plains",       "snowy_taiga",              "snowy_taiga"],
    [["meadow", "cherry_grove"],     "meadow",                   ["forest", "meadow"], ["taiga", "meadow"],        ["old_growth_spruce_taiga", "old_growth_pine_taiga"]],
    [["meadow", "cherry_grove"],     ["meadow", "cherry_grove"], ["meadow", "forest"], ["meadow", "birch_forest"], "pale_garden"],
    ["savanna_plateau",              "savanna_plateau",          "forest",             "forest",                   "jungle"],
    BADLANDS_ROW
]));

const shattered = category(thTable({}, [
    WINDSWEPT_ROW,
    WINDSWEPT_ROW,
    ["windswept_hills", "windswept_hills", "windswept_hills",    "windswept_forest",          "windswept_forest"],
    ["savanna",         "savanna",         ["forest", "plains"], ["jungle", "sparse_jungle"], ["jungle", "bamboo_jungle"]],
    DESERT_ROW
]));

const river = (w: Box) =>
    byLevel("temperature", w, ["frozen_river", "river", "river", "river", "river"]);
const stonyShore = (w: Box) => [rule("stony_shore", w)];
const slopes = (w: Box, temperature: Box["temperature"]) =>
    byLevel("humidity", { ...w, temperature }, ["snowy_slopes", "snowy_slopes", "grove", "grove", "grove"]);

const ICY_PEAK: Cell = ["jagged_peaks", "frozen_peaks"];
const peaks = (w: Box) => [
    ...byLevel("temperature", w, [ICY_PEAK, ICY_PEAK, ICY_PEAK, "stony_peaks"]),
    ...badlands(and(w, { temperature: T.Hot })!)
];

const middleOrBadlands = (w: Box) => [
    ...middle(and(w, { temperature: [T.Frozen, T.Warm] })!),
    ...badlands(and(w, { temperature: T.Hot })!)
];
const slopesT0Middle = (w: Box) => [
    ...slopes(w, T.Frozen),
    ...middle(and(w, { temperature: [T.Cool, T.Warm] })!),
    ...badlands(and(w, {temperature: T.Hot })!)
];
const slopesLT3Plateau = (w: Box) => [
    ...slopes(w, [T.Frozen, T.Neutral]),
    ...plateau(and(w, { temperature: [T.Warm, T.Hot] })!)
];
const slopesT0Plateau = (w: Box) => [
    ...slopes(w, T.Frozen),
    ...plateau(and(w, { temperature: [T.Cool, T.Hot] })!)
]
const beachOrMiddle = (w: Box) => [
    ...beach({ ...w, weirdness: W.Neg }),
    ...middle({ ...w, weirdness: W.Pos })
];

const WINDY: Box = { weirdness: W.Pos, temperature: [T.Neutral, T.Hot], humidity: [H.Arid, H.Wet] }
const NOT_WINDY: Box[] = [
    { weirdness: W.Neg },
    { weirdness: W.Pos, temperature: [T.Frozen, T.Cool] },
    { weirdness: W.Pos, temperature: [T.Neutral, T.Hot], humidity: H.Humid }
];
const withWindswept = (cat: Category) => (w: Box): Rule[] => {
    const windy = and(w, WINDY);
    return [
        ...NOT_WINDY.flatMap(b => { const x = and(w, b); return x ? cat(x): []; }),
        ...(windy ? [rule("windswept_savanna", windy)] : [])
    ];
};
const middleOrWindswept = withWindswept(middle);
const shatteredOrWindswept = withWindswept(shattered);
const coastE5 = (w: Box) => [
    ...beach({ ...w, weirdness: W.Neg }),
    ...middleOrWindswept({ ...w, weirdness: W.Pos })
];

const swampRiver = (w: Box) => [
    rule("frozen_river",    { ...w, temperature: T.Frozen }),
    rule("swamp",           { ...w, temperature: [T.Cool, T.Neutral] }),
    rule("mangrove_swamp",  { ...w, temperature: [T.Warm, T.Hot] })
];
const swampMiddle = (w: Box) => [
    ...middle({ ...w, temperature: T.Frozen }),
    rule("swamp",           { ...w, temperature: [T.Cool, T.Neutral] }),
    rule("mangrove_swamp",  { ...w, temperature: [T.Warm, T.Hot] })
];

const at = (
    erosion: number,
    peaksValleys: number | readonly [number, number],
    continentalness: number | readonly [number, number]
): Box => ({ erosion, peaksValleys, continentalness });

const MID_FAR = [C.MidInland, C.FarInland] as const;

const inland: Rule[] = [
    // E = 0
    ...river(at(E.L0, PV.Valleys, [C.Coast, C.NearInland])),
    ...middleOrBadlands(at(E.L0, PV.Valleys, MID_FAR)),
    ...stonyShore(at(E.L0, [PV.Low, PV.Mid], C.Coast)),
    ...middleOrBadlands(at(E.L0, PV.Low, C.NearInland)),
    ...slopesT0Middle(at(E.L0, PV.Low, MID_FAR)),
    ...slopesLT3Plateau(at(E.L0, PV.Mid, [C.NearInland, C.FarInland])),
    ...middle(at(E.L0, PV.High, C.Coast)),
    ...slopesLT3Plateau(at(E.L0, PV.High, C.NearInland)),
    ...peaks(at(E.L0, PV.High, MID_FAR)),
    ...peaks(at(E.L0, PV.Peaks, [C.Coast, C.FarInland])),
    // E = 1
    ...river(at(E.L1, PV.Valleys, [C.Coast, C.NearInland])),
    ...middleOrBadlands(at(E.L1, PV.Valleys, MID_FAR)),
    ...stonyShore(at(E.L1, [PV.Low, PV.Mid], C.Coast)),
    ...middleOrBadlands(at(E.L1, PV.Low, C.NearInland)),
    ...slopesT0Middle(at(E.L1, PV.Low, MID_FAR)),
    ...slopesT0Middle(at(E.L1, PV.Mid, [C.NearInland, C.MidInland])),
    ...slopesT0Plateau(at(E.L1, PV.Mid, C.FarInland)),
    ...middle(at(E.L1, PV.High, C.Coast)),
    ...slopesT0Middle(at(E.L1, PV.High, C.NearInland)),
    ...slopesLT3Plateau(at(E.L1, PV.High, MID_FAR)),
    ...slopesT0Middle(at(E.L1, PV.Peaks, [C.Coast, C.NearInland])),
    ...peaks(at(E.L1, PV.Peaks, MID_FAR)),
    // E = 2
    ...river(at(E.L2, PV.Valleys, [C.Coast, C.FarInland])),
    ...stonyShore(at(E.L2, [PV.Low, PV.Mid], C.Coast)),
    ...middle(at(E.L2, [PV.Low, PV.Mid], C.NearInland)),
    ...middleOrBadlands(at(E.L2, PV.Low, MID_FAR)),
    ...middleOrBadlands(at(E.L2, PV.Mid, C.MidInland)),
    ...plateau(at(E.L2, PV.Mid, C.FarInland)),
    ...middle(at(E.L2, [PV.High, PV.Peaks], [C.Coast, C.NearInland])),
    ...plateau(at(E.L2, [PV.High, PV.Peaks], MID_FAR)),
    // E = 3
    ...river(at(E.L3, PV.Valleys, [C.Coast, C.FarInland])),
    ...beach(at(E.L3, PV.Low, C.Coast)),
    ...middle(at(E.L3, PV.Low, C.NearInland)),
    ...middleOrBadlands(at(E.L3, PV.Low, MID_FAR)),
    ...middle(at(E.L3, PV.Mid, [C.Coast, C.NearInland])),
    ...middleOrBadlands(at(E.L3, PV.Mid, MID_FAR)),
    ...middle(at(E.L3, [PV.High, PV.Peaks], [C.Coast, C.NearInland])),
    ...middleOrBadlands(at(E.L3, [PV.High, PV.Peaks], C.MidInland)),
    ...plateau(at(E.L3, [PV.High, PV.Peaks], C.FarInland)),
    // E = 4
    ...river(at(E.L4, PV.Valleys, [C.Coast, C.FarInland])),
    ...beach(at(E.L4, PV.Low, C.Coast)),
    ...middle(at(E.L4, [PV.Low, PV.Mid], [C.NearInland, C.FarInland])),
    ...beachOrMiddle(at(E.L4, PV.Mid, C.Coast)),
    ...middle(at(E.L4, [PV.High, PV.Peaks], [C.Coast, C.FarInland])),
    // E = 5
    ...river(at(E.L5, PV.Valleys, [C.Coast, C.FarInland])),
    ...coastE5(at(E.L5, [PV.Low, PV.Mid], C.Coast)),
    ...middleOrWindswept(at(E.L5, [PV.Low, PV.Mid], C.NearInland)),
    ...middle(at(E.L5, PV.Low, MID_FAR)),
    ...shattered(at(E.L5, PV.Mid, MID_FAR)),
    ...middleOrWindswept(at(E.L5, PV.High, [C.Coast, C.NearInland])),
    ...shattered(at(E.L5, PV.High, MID_FAR)),
    ...shatteredOrWindswept(at(E.L5, PV.Peaks, [C.Coast, C.NearInland])),
    ...shattered(at(E.L5, PV.Peaks, MID_FAR)),

    // ===== E=6 =====
    ...river(at(E.L6, PV.Valleys, C.Coast)),
    ...swampRiver(at(E.L6, PV.Valleys, [C.NearInland, C.FarInland])),
    ...beach(at(E.L6, PV.Low, C.Coast)),
    ...swampMiddle(at(E.L6, PV.Low, [C.NearInland, C.FarInland])),
    ...beachOrMiddle(at(E.L6, PV.Mid, C.Coast)),
    ...swampMiddle(at(E.L6, PV.Mid, [C.NearInland, C.FarInland])),
    ...middle(at(E.L6, [PV.High, PV.Peaks], [C.Coast, C.FarInland])),
];

export const RULES: readonly Rule[] = [...oceans, ...inland];
