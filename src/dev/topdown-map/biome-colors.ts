// Biome colors by BiomeID (1..52)
export const BIOME_COLORS: readonly string[] = [
    "#000000", // 0: unused

    "#315B91", //  1 ocean
    "#183B70", //  2 deep_ocean
    "#3D9EAD", //  3 warm_ocean
    "#398B9F", //  4 lukewarm_ocean
    "#28677F", //  5 deep_lukewarm_ocean
    "#416F9F", //  6 cold_ocean
    "#2D507D", //  7 deep_cold_ocean
    "#A5C9D8", //  8 frozen_ocean
    "#668DAA", //  9 deep_frozen_ocean
    "#756B91", // 10 mushroom_fields

    "#8A8F91", // 11 jagged_peaks
    "#D7E5EC", // 12 frozen_peaks
    "#A6A39A", // 13 stony_peaks
    "#8DBB69", // 14 meadow
    "#E6A7C5", // 15 cherry_grove
    "#78966B", // 16 grove
    "#C5D5D8", // 17 snowy_slopes
    "#9BA58A", // 18 windswept_hills
    "#A99D87", // 19 windswept_gravelly_hills
    "#607F57", // 20 windswept_forest

    "#39734A", // 21 forest
    "#65A65D", // 22 flower_forest
    "#567C46", // 23 taiga
    "#6C7650", // 24 old_growth_pine_taiga
    "#52714D", // 25 old_growth_spruce_taiga
    "#B8C9C1", // 26 snowy_taiga
    "#83A95F", // 27 birch_forest
    "#9EBB70", // 28 old_growth_birch_forest
    "#294D37", // 29 dark_forest
    "#777D69", // 30 pale_garden

    "#32965A", // 31 jungle
    "#78A65B", // 32 sparse_jungle
    "#23805A", // 33 bamboo_jungle
    "#5C8A4B", // 34 dappled_forest

    "#4C9CB2", // 35 river
    "#B4D9E8", // 36 frozen_river
    "#657D45", // 37 swamp
    "#477C52", // 38 mangrove_swamp
    "#D8C58B", // 39 beach
    "#E4E8DF", // 40 snowy_beach
    "#9B9D98", // 41 stony_shore

    "#9BCB69", // 42 plains
    "#D8D76B", // 43 sunflower_plains
    "#D5DEDB", // 44 snowy_plains
    "#C1DCE7", // 45 ice_spikes

    "#D9B66F", // 46 desert
    "#B5AC55", // 47 savanna
    "#9E914A", // 48 savanna_plateau
    "#C18C52", // 49 windswept_savanna
    "#B96F45", // 50 badlands
    "#C28A51", // 51 wooded_badlands
    "#D49A58", // 52 eroded_badlands
];

export const BIOME_RGB = new Uint8Array(256 * 3);
for (let i = 0; i < 256; i++) BIOME_RGB.set([255, 0, 255], i * 3);
BIOME_COLORS.forEach((hex, i) => {
    BIOME_RGB[i * 3]     = parseInt(hex.slice(1, 3), 16);
    BIOME_RGB[i * 3 + 1] = parseInt(hex.slice(3, 5), 16);
    BIOME_RGB[i * 3 + 2] = parseInt(hex.slice(5, 7), 16);
});
