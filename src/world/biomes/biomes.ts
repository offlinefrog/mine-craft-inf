import { BIOME, biomeRegion, type Biome } from "./biome"

export const DEFAULT_BIOMES: Biome[] = [];

function biome(data: Biome): Biome {
    DEFAULT_BIOMES.push(data);
    return data;
}

const Ocean: Biome = biome({
    id: BIOME.OCEAN,
    regions: [
        biomeRegion({ temperature: [2, 2], continentalness: [2, 2] })
    ]
})
const DeepOcean: Biome = biome({
    id: BIOME.DEEP_OCEAN,
    regions: [
        biomeRegion({ temperature: [2, 2], continentalness: [1, 1] })
    ]
})
const WarmOcean: Biome = biome({
    id: BIOME.WARM_OCEAN,
    regions: [
        biomeRegion({ temperature: [4, 4], continentalness: [1, 2] })
    ]
})
const LukewarmOcean: Biome = biome({
    id: BIOME.LUKEWARM_OCEAN,
    regions: [
        biomeRegion({ temperature: [3, 3], continentalness: [2, 2] })
    ]
})
const DeepLukewarmOcean: Biome = biome({
    id: BIOME.DEEP_LUKEWARM_OCEAN,
    regions: [
        biomeRegion({ temperature: [3, 3], continentalness: [1, 1] })
    ]
})
const ColdOcean: Biome = biome({
    id: BIOME.COLD_OCEAN,
    regions: [
        biomeRegion({ temperature: [1, 1], continentalness: [2, 2] })
    ]
})
const DeepColdOcean: Biome = biome({
    id: BIOME.DEEP_COLD_OCEAN,
    regions: [
        biomeRegion({ temperature: [1, 1], continentalness: [1, 1] })
    ]
})
const FrozenOcean: Biome = biome({
    id: BIOME.FROZEN_OCEAN,
    regions: [
        biomeRegion({ temperature: [0, 0], continentalness: [2, 2] })
    ]
})
const DeepFrozenOcean: Biome = biome({
    id: BIOME.DEEP_FROZEN_OCEAN,
    regions: [
        biomeRegion({ temperature: [0, 0], continentalness: [1, 1] })
    ]
})
const MushroomFields: Biome = biome({
    id: BIOME.MUSHROOM_FIELDS,
    regions: [
        biomeRegion({ continentalness: [0, 0] })
    ]
})

const JaggedPeaks: Biome = biome({
    id: BIOME.JAGGED_PEAKS,
    regions: [
        biomeRegion({ temperature: [0, 2], continentalness: [5, 6], erosion: [0, 0], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 2], continentalness: [3, 6], erosion: [0, 0], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [0, 2], continentalness: [5, 6], erosion: [1, 1], weirdness: [0, 0], PV: [4, 4] })
    ]
})
const FrozenPeaks: Biome = biome({
    id: BIOME.FROZEN_PEAKS,
    regions: [
        biomeRegion({ temperature: [0, 2], continentalness: [5, 6], erosion: [0, 0], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 2], continentalness: [3, 6], erosion: [0, 0], weirdness: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [0, 2], continentalness: [5, 6], erosion: [1, 1], weirdness: [1, 1], PV: [4, 4] })
    ]
})
const StonyPeaks: Biome = biome({
    id: BIOME.STONY_PEAKS,
    regions: [
        biomeRegion({ temperature: [3, 3], continentalness: [5, 6], erosion: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], continentalness: [3, 6], erosion: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [3, 3], continentalness: [5, 6], erosion: [1, 1], PV: [4, 4] })
    ]
})
const Meadow: Biome = biome({
    id: BIOME.MEADOW,
    regions: [
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [6, 6], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [1, 1], continentalness: [6, 6], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [2, 3], continentalness: [6, 6], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 3], continentalness: [6, 6], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [5, 6], erosion: [2, 2], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [1, 1], continentalness: [5, 6], erosion: [2, 2], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [2, 3], continentalness: [5, 6], erosion: [2, 2], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 3], continentalness: [5, 6], erosion: [2, 2], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [6, 6], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [1, 1], continentalness: [6, 6], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [2, 3], continentalness: [6, 6], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 3], continentalness: [6, 6], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] })
    ]
})
const CherryGrove: Biome = biome({
    id: BIOME.CHERRY_GROVE,
    regions: [
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [6, 6], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 1], continentalness: [6, 6], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [5, 6], erosion: [2, 2], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 1], continentalness: [5, 6], erosion: [2, 2], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [6, 6], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 1], continentalness: [6, 6], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] })
    ]
})
const Grove: Biome = biome({
    id: BIOME.GROVE,
    regions: [
        biomeRegion({ temperature: [0, 0], humidity: [2, 4], continentalness: [5, 6], erosion: [0, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 2], humidity: [2, 4], continentalness: [4, 6], erosion: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 2], humidity: [2, 4], continentalness: [4, 4], erosion: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 4], continentalness: [4, 6], erosion: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 4], continentalness: [4, 4], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 2], humidity: [2, 4], continentalness: [5, 6], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 4], continentalness: [3, 4], erosion: [1, 1], PV: [4, 4] })
    ]
})
const SnowySlopes: Biome = biome({
    id: BIOME.SNOWY_SLOPES,
    regions: [
        biomeRegion({ temperature: [0, 0], humidity: [0, 1], continentalness: [5, 6], erosion: [0, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 2], humidity: [0, 1], continentalness: [4, 6], erosion: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 2], humidity: [0, 1], continentalness: [4, 4], erosion: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 1], continentalness: [4, 6], erosion: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 1], continentalness: [4, 4], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 2], humidity: [0, 1], continentalness: [5, 6], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 1], continentalness: [3, 4], erosion: [1, 1], PV: [4, 4] })
    ]
})
const WindsweptHills: Biome = biome({
    id: BIOME.WINDSWEPT_HILLS,
    regions: [
        biomeRegion({ temperature: [0, 1], humidity: [2, 2], continentalness: [5, 6], erosion: [5, 5], PV: [2, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 2], continentalness: [5, 6], erosion: [5, 5], PV: [2, 4] }),
        biomeRegion({ temperature: [0, 1], humidity: [2, 2], continentalness: [3, 4], erosion: [5, 5], PV: [4, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 2], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [4, 4] })
    ]
})
const WindsweptGravellyHills: Biome = biome({
    id: BIOME.WINDSWEPT_GRAVELLY_HILLS,
    regions: [
        biomeRegion({ temperature: [0, 1], humidity: [0, 1], continentalness: [5, 6], erosion: [5, 5], PV: [2, 4] }),
        biomeRegion({ temperature: [0, 1], humidity: [0, 1], continentalness: [3, 4], erosion: [5, 5], PV: [4, 4] })
    ]
})
const WindsweptForest: Biome = biome({
    id: BIOME.WINDSWEPT_FOREST,
    regions: [
        biomeRegion({ temperature: [0, 2], humidity: [3, 4], continentalness: [5, 6], erosion: [5, 5], PV: [2, 3] }),
        biomeRegion({ temperature: [0, 2], humidity: [3, 4], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [0, 1], humidity: [3, 4], continentalness: [3, 6], erosion: [5, 5], PV: [4, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 4], erosion: [5, 5], PV: [4, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 4], continentalness: [5, 6], erosion: [5, 5], PV: [4, 4] })
    ]
})

const Forest: Biome = biome({
    id: BIOME.FOREST,
    regions: [
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [5, 6], erosion: [0, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [5, 6], erosion: [0, 1], weirdness: [0, 0], PV: [0, 1] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [4, 4], erosion: [0, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [4, 4], erosion: [0, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 3], continentalness: [4, 6], erosion: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [3, 3], erosion: [0, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 3], erosion: [0, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 3], continentalness: [4, 4], erosion: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [4, 5], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [4, 5], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [2, 2], continentalness: [6, 6], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [2, 2], continentalness: [6, 6], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 3], continentalness: [6, 6], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [4, 4], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [4, 4], erosion: [1, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 3], continentalness: [5, 6], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [3, 4], erosion: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 4], erosion: [1, 1], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [5, 6], erosion: [2, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [5, 6], erosion: [2, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [3, 4], erosion: [2, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 4], erosion: [2, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [2, 2], continentalness: [5, 6], erosion: [2, 2], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [2, 2], continentalness: [5, 6], erosion: [2, 2], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 3], continentalness: [5, 6], erosion: [2, 2], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [3, 6], erosion: [3, 3], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 6], erosion: [3, 3], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [5, 5], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [5, 5], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [2, 2], continentalness: [6, 6], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [2, 2], continentalness: [6, 6], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 3], continentalness: [6, 6], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [4, 6], erosion: [4, 4], PV: [1, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [4, 6], erosion: [4, 4], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [3, 3], erosion: [4, 4], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [3, 6], erosion: [4, 4], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 6], erosion: [4, 4], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [2, 2], continentalness: [3, 3], erosion: [5, 5], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 3], humidity: [2, 2], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [2, 2], continentalness: [4, 4], erosion: [5, 5], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [5, 6], erosion: [5, 5], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [5, 6], erosion: [5, 5], weirdness: [0, 0], PV: [1, 4] }),
        biomeRegion({ temperature: [1, 3], humidity: [2, 2], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [2, 2], continentalness: [3, 4], erosion: [5, 5], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [3, 3], erosion: [6, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [2, 2], continentalness: [3, 6], erosion: [6, 6], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 6], erosion: [6, 6], weirdness: [0, 0], PV: [3, 4] })
    ]
})
const FlowerForest: Biome = biome({
    id: BIOME.FLOWER_FOREST,
    regions: [
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [5, 6], erosion: [0, 1], weirdness: [0, 0], PV: [0, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 4], erosion: [0, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 3], erosion: [0, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 5], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 4], erosion: [1, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 4], erosion: [1, 1], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [5, 6], erosion: [2, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 4], erosion: [2, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 6], erosion: [3, 3], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [5, 5], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 6], erosion: [4, 4], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 6], erosion: [4, 4], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 6], erosion: [5, 5], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 6], erosion: [6, 6], weirdness: [0, 0], PV: [3, 4] })
    ]
})
const Taiga: Biome = biome({
    id: BIOME.TAIGA,
    regions: [
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [5, 6], erosion: [0, 1], PV: [0, 0] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [5, 6], erosion: [0, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [4, 4], erosion: [0, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [4, 4], erosion: [0, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [3, 3], erosion: [0, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [3, 3], erosion: [0, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [4, 5], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [6, 6], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [4, 4], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [3, 4], erosion: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [5, 6], erosion: [2, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [5, 6], erosion: [2, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [4, 5], erosion: [2, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [3, 4], erosion: [2, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [3, 4], erosion: [2, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [5, 6], erosion: [2, 2], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [3, 6], erosion: [3, 3], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [3, 6], erosion: [3, 3], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [5, 5], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [5, 5], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [6, 6], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [4, 6], erosion: [4, 4], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [4, 6], erosion: [4, 4], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [3, 3], erosion: [4, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [3, 3], erosion: [4, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [3, 6], erosion: [4, 4], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [3, 6], erosion: [4, 4], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [3, 3], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [3, 3], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [4, 6], erosion: [5, 6], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [4, 6], erosion: [5, 5], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [4, 4], erosion: [5, 5], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [4, 4], erosion: [5, 5], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [3, 4], erosion: [5, 5], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [3, 4], erosion: [5, 5], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [4, 6], erosion: [6, 6], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [4, 4], continentalness: [3, 6], erosion: [6, 6], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [3, 3], continentalness: [3, 6], erosion: [6, 6], PV: [3, 4] })
    ]
})
const OldGrowthPineTaiga: Biome = biome({
    id: BIOME.OLD_GROWTH_PINE_TAIGA,
    regions: [
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 4], erosion: [0, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 3], erosion: [0, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 6], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 4], erosion: [1, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 4], erosion: [1, 1], weirdness: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 6], erosion: [2, 4], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 6], erosion: [3, 3], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 6], erosion: [4, 4], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 3], erosion: [4, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 6], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 4], erosion: [5, 5], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 4], erosion: [5, 5], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 6], erosion: [6, 6], weirdness: [1, 1], PV: [3, 4] })
    ]
})
const OldGrowthSpruceTaiga: Biome = biome({
    id: BIOME.OLD_GROWTH_SPRUCE_TAIGA,
    regions: [
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [5, 6], erosion: [0, 1], weirdness: [0, 0], PV: [0, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 4], erosion: [0, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 3], erosion: [0, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 6], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 4], erosion: [1, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 4], erosion: [1, 1], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [5, 6], erosion: [2, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 6], erosion: [2, 4], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 6], erosion: [3, 3], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 6], erosion: [4, 4], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 6], erosion: [5, 5], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [4, 4], continentalness: [3, 6], erosion: [6, 6], weirdness: [0, 0], PV: [3, 4] })
    ]
})
const SnowyTaiga: Biome = biome({
    id: BIOME.SNOWY_TAIGA,
    regions: [
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 0] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [5, 6], erosion: [0, 1], PV: [0, 0] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 4], erosion: [0, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [4, 4], erosion: [0, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 3], erosion: [0, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [3, 3], erosion: [0, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [5, 6], erosion: [2, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 5], erosion: [2, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [4, 5], erosion: [2, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 4], continentalness: [6, 6], erosion: [2, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 4], erosion: [2, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [3, 4], erosion: [2, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 4], continentalness: [5, 6], erosion: [2, 2], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 6], erosion: [3, 3], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [3, 6], erosion: [3, 3], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [5, 5], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [5, 5], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 4], continentalness: [6, 6], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 6], erosion: [4, 4], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [4, 6], erosion: [4, 4], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 3], continentalness: [3, 3], erosion: [4, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 6], erosion: [4, 4], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [3, 6], erosion: [4, 4], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 3], continentalness: [3, 3], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [4, 6], erosion: [5, 6], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 6], erosion: [5, 6], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [4, 4], erosion: [5, 5], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 4], erosion: [5, 5], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [3, 4], erosion: [5, 5], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 4], erosion: [5, 5], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 6], erosion: [6, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [4, 6], erosion: [6, 6], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 6], erosion: [6, 6], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [3, 3], continentalness: [3, 6], erosion: [6, 6], PV: [3, 4] })
    ]
})
const BirchForest: Biome = biome({
    id: BIOME.BIRCH_FOREST,
    regions: [
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [5, 6], erosion: [0, 1], weirdness: [0, 0], PV: [0, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 4], erosion: [0, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 3], erosion: [0, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 5], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [6, 6], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 4], erosion: [1, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 4], erosion: [1, 1], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [5, 6], erosion: [2, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 4], erosion: [2, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [5, 6], erosion: [2, 2], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 6], erosion: [3, 3], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [5, 5], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [6, 6], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 6], erosion: [4, 4], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 6], erosion: [4, 4], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 6], erosion: [5, 5], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 6], erosion: [6, 6], weirdness: [0, 0], PV: [3, 4] })
    ]
})
const OldGrowthBirchForest: Biome = biome({
    id: BIOME.OLD_GROWTH_BIRCH_FOREST,
    regions: [
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 4], erosion: [0, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 3], erosion: [0, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 5], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 4], erosion: [1, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 4], erosion: [1, 1], weirdness: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 4], erosion: [2, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 6], erosion: [3, 3], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [5, 5], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [4, 6], erosion: [4, 4], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 3], erosion: [4, 4], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 6], erosion: [4, 4], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [5, 6], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 3], erosion: [6, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [3, 3], continentalness: [3, 6], erosion: [6, 6], weirdness: [1, 1], PV: [3, 4] })
    ]
})
const DarkForest: Biome = biome({
    id: BIOME.DARK_FOREST,
    regions: [
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [5, 6], erosion: [0, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [4, 4], erosion: [0, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 3], erosion: [0, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [4, 5], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [4, 4], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 4], erosion: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [5, 6], erosion: [2, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 4], erosion: [2, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 6], erosion: [3, 3], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [5, 5], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [4, 6], erosion: [4, 4], PV: [1, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 3], erosion: [4, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 6], erosion: [4, 4], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 3], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [4, 6], erosion: [5, 5], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [4, 4], erosion: [5, 5], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 4], erosion: [5, 5], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [3, 6], erosion: [6, 6], PV: [3, 4] })
    ]
})
const PaleGarden: Biome = biome({
    id: BIOME.PALE_GARDEN,
    regions: [
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [6, 6], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [5, 6], erosion: [2, 2], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [4, 4], continentalness: [6, 6], erosion: [3, 3], PV: [3, 4] })
    ]
})
const Jungle: Biome = biome({
    id: BIOME.JUNGLE,
    regions: [
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [5, 6], erosion: [0, 1], weirdness: [0, 0], PV: [0, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [4, 4], erosion: [0, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [4, 6], erosion: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [3, 3], erosion: [0, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [4, 4], erosion: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [4, 5], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [6, 6], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [4, 4], erosion: [1, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [5, 6], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [3, 4], erosion: [1, 1], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [5, 6], erosion: [2, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [3, 4], erosion: [2, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [5, 6], erosion: [2, 2], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [3, 6], erosion: [3, 3], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [5, 5], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [6, 6], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [4, 6], erosion: [4, 5], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 4], continentalness: [3, 6], erosion: [4, 6], weirdness: [0, 0], PV: [3, 4] })
    ]
})
const SparseJungle: Biome = biome({
    id: BIOME.SPARSE_JUNGLE,
    regions: [
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [4, 4], erosion: [0, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [3, 3], erosion: [0, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [4, 5], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [4, 4], erosion: [1, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [3, 4], erosion: [1, 1], weirdness: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [3, 4], erosion: [2, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [3, 6], erosion: [3, 3], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [5, 5], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [4, 6], erosion: [4, 4], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [3, 3], erosion: [4, 4], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [3, 6], erosion: [4, 4], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [5, 6], erosion: [5, 5], weirdness: [1, 1], PV: [1, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [3, 3], erosion: [6, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [3, 3], continentalness: [3, 6], erosion: [6, 6], weirdness: [1, 1], PV: [3, 4] })
    ]
})
const BambooJungle: Biome = biome({
    id: BIOME.BAMBOO_JUNGLE,
    regions: [
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [4, 4], erosion: [0, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [3, 3], erosion: [0, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [4, 5], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [4, 4], erosion: [1, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [3, 4], erosion: [1, 1], weirdness: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [3, 4], erosion: [2, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [3, 6], erosion: [3, 3], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [5, 5], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [4, 6], erosion: [4, 4], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [3, 3], erosion: [4, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [3, 6], erosion: [4, 6], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [3, 6], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [4, 4], continentalness: [4, 6], erosion: [5, 5], weirdness: [1, 1], PV: [2, 2] })
    ]
})
const DappledForest: Biome = biome({
    id: BIOME.DAPPLED_FOREST,
    regions: [
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 4], erosion: [0, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 3], erosion: [0, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 5], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 4], erosion: [1, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 4], erosion: [1, 1], weirdness: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 4], erosion: [2, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 6], erosion: [3, 3], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [5, 5], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 6], erosion: [4, 4], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 3], erosion: [4, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 6], erosion: [4, 4], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 6], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 4], erosion: [5, 5], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 4], erosion: [5, 5], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 6], erosion: [6, 6], weirdness: [1, 1], PV: [3, 4] })
    ]
})

const River: Biome = biome({
    id: BIOME.RIVER,
    regions: [
        biomeRegion({ temperature: [1, 4], continentalness: [3, 4], erosion: [0, 1], PV: [0, 0] }),
        biomeRegion({ temperature: [1, 4], continentalness: [3, 6], erosion: [2, 5], PV: [0, 0] }),
        biomeRegion({ temperature: [1, 4], continentalness: [3, 3], erosion: [6, 6], PV: [0, 0] })
    ]
})
const FrozenRiver: Biome = biome({
    id: BIOME.FROZEN_RIVER,
    regions: [
        biomeRegion({ temperature: [0, 0], continentalness: [3, 4], erosion: [0, 1], PV: [0, 0] }),
        biomeRegion({ temperature: [0, 0], continentalness: [3, 6], erosion: [2, 6], PV: [0, 0] })
    ]
})
const Swamp: Biome = biome({
    id: BIOME.SWAMP,
    regions: [
        biomeRegion({ temperature: [1, 2], continentalness: [4, 6], erosion: [6, 6], PV: [0, 2] })
    ]
})
const MangroveSwamp: Biome = biome({
    id: BIOME.MANGROVE_SWAMP,
    regions: [
        biomeRegion({ temperature: [3, 4], continentalness: [4, 6], erosion: [6, 6], PV: [0, 2] })
    ]
})
const Beach: Biome = biome({
    id: BIOME.BEACH,
    regions: [
        biomeRegion({ temperature: [1, 3], continentalness: [3, 3], erosion: [3, 4], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 3], continentalness: [3, 3], erosion: [4, 6], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 3], continentalness: [3, 3], erosion: [5, 5], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 3], continentalness: [3, 3], erosion: [6, 6], PV: [1, 1] })
    ]
})
const SnowyBeach: Biome = biome({
    id: BIOME.SNOWY_BEACH,
    regions: [
        biomeRegion({ temperature: [0, 0], continentalness: [3, 3], erosion: [3, 4], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], continentalness: [3, 3], erosion: [4, 6], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], continentalness: [3, 3], erosion: [5, 5], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], continentalness: [3, 3], erosion: [6, 6], PV: [1, 1] })
    ]
})
const StonyShore: Biome = biome({
    id: BIOME.STONY_SHORE,
    regions: [
        biomeRegion({ continentalness: [3, 3], erosion: [0, 2], PV: [1, 2] })
    ]
})

const Plains: Biome = biome({
    id: BIOME.PLAINS,
    regions: [
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [5, 6], erosion: [0, 1], weirdness: [0, 0], PV: [0, 1] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [5, 6], erosion: [0, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 4], erosion: [0, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [4, 4], erosion: [0, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [4, 4], erosion: [0, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 3], erosion: [0, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [3, 3], erosion: [0, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 3], erosion: [0, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 5], erosion: [1, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [4, 5], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [4, 5], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 4], erosion: [1, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [4, 4], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [4, 4], erosion: [1, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 4], erosion: [1, 1], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [3, 4], erosion: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 4], erosion: [1, 1], weirdness: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [5, 6], erosion: [2, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [5, 6], erosion: [2, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 4], erosion: [2, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [3, 4], erosion: [2, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 4], erosion: [2, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 6], erosion: [3, 3], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [3, 6], erosion: [3, 3], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 6], erosion: [3, 3], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [5, 5], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [5, 5], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [5, 5], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 6], erosion: [4, 4], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [4, 6], erosion: [4, 4], PV: [1, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [4, 6], erosion: [4, 4], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [3, 3], erosion: [4, 4], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 3], erosion: [4, 4], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 6], erosion: [4, 4], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [3, 6], erosion: [4, 4], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 6], erosion: [4, 4], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [1, 1], continentalness: [3, 3], erosion: [5, 5], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 6], erosion: [5, 5], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [1, 1], continentalness: [4, 4], erosion: [5, 5], PV: [1, 2] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [5, 6], erosion: [5, 5], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [5, 6], erosion: [5, 5], weirdness: [1, 1], PV: [1, 4] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 1], humidity: [1, 1], continentalness: [3, 4], erosion: [5, 5], PV: [3, 3] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [3, 3], erosion: [6, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 3], erosion: [6, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [1, 1], humidity: [0, 0], continentalness: [3, 6], erosion: [6, 6], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [1, 2], humidity: [1, 1], continentalness: [3, 6], erosion: [6, 6], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [2, 2], continentalness: [3, 6], erosion: [6, 6], weirdness: [1, 1], PV: [3, 4] })
    ]
})
const SunflowerPlains: Biome = biome({
    id: BIOME.SUNFLOWER_PLAINS,
    regions: [
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 4], erosion: [0, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 3], erosion: [0, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 5], erosion: [1, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 4], erosion: [1, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 4], erosion: [1, 1], weirdness: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 4], erosion: [2, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 6], erosion: [3, 3], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [5, 5], erosion: [3, 3], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [4, 6], erosion: [4, 4], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 3], erosion: [4, 4], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 6], erosion: [4, 4], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [5, 6], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 3], erosion: [6, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [2, 2], humidity: [0, 0], continentalness: [3, 6], erosion: [6, 6], weirdness: [1, 1], PV: [3, 4] })
    ]
})
const SnowyPlains: Biome = biome({
    id: BIOME.SNOWY_PLAINS,
    regions: [
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [5, 6], erosion: [0, 1], weirdness: [0, 0], PV: [0, 0] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [5, 6], erosion: [0, 1], PV: [0, 0] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [5, 6], erosion: [0, 1], weirdness: [0, 0], PV: [0, 0] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 4], erosion: [0, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [4, 4], erosion: [0, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 4], erosion: [0, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 3], erosion: [0, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [3, 3], erosion: [0, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 3], erosion: [0, 1], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [5, 6], erosion: [2, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [5, 6], erosion: [2, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [5, 6], erosion: [2, 3], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 6], erosion: [2, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [4, 5], erosion: [2, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 5], erosion: [2, 2], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 2], continentalness: [6, 6], erosion: [2, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 6], erosion: [2, 4], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [3, 4], erosion: [2, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 4], erosion: [2, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 2], continentalness: [5, 6], erosion: [2, 2], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 6], erosion: [3, 3], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [3, 6], erosion: [3, 3], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 6], erosion: [3, 3], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [5, 5], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [5, 5], erosion: [3, 3], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 2], continentalness: [6, 6], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 6], erosion: [4, 4], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [4, 6], erosion: [4, 4], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 6], erosion: [4, 4], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [3, 3], erosion: [4, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [3, 6], erosion: [4, 4], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 6], erosion: [4, 4], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [3, 3], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 2], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [4, 6], erosion: [5, 6], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [5, 6], erosion: [5, 5], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [5, 6], erosion: [5, 5], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [4, 4], erosion: [5, 5], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 2], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [3, 4], erosion: [5, 5], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 6], erosion: [6, 6], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [4, 6], erosion: [6, 6], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [4, 6], erosion: [6, 6], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 6], erosion: [6, 6], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [1, 1], continentalness: [3, 6], erosion: [6, 6], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [2, 2], continentalness: [3, 6], erosion: [6, 6], weirdness: [0, 0], PV: [3, 4] })
    ]
})
const IceSpikes: Biome = biome({
    id: BIOME.ICE_SPIKES,
    regions: [
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 0] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 4], erosion: [0, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 3], erosion: [0, 1], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 6], erosion: [2, 2], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 6], erosion: [2, 4], weirdness: [1, 1], PV: [3, 4] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 6], erosion: [3, 3], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 6], erosion: [4, 4], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 3], erosion: [4, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 6], erosion: [5, 5], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 4], erosion: [5, 5], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 4], erosion: [5, 5], weirdness: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [4, 6], erosion: [6, 6], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [0, 0], humidity: [0, 0], continentalness: [3, 6], erosion: [6, 6], weirdness: [1, 1], PV: [3, 4] })
    ]
})

const Desert: Biome = biome({
    id: BIOME.DESERT,
    regions: [
        biomeRegion({ temperature: [4, 4], continentalness: [3, 3], erosion: [0, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [4, 4], continentalness: [4, 4], erosion: [2, 2], PV: [1, 2] }),
        biomeRegion({ temperature: [4, 4], continentalness: [3, 4], erosion: [2, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [4, 4], continentalness: [3, 4], erosion: [3, 3], PV: [1, 2] }),
        biomeRegion({ temperature: [4, 4], continentalness: [3, 6], erosion: [4, 4], PV: [1, 4] }),
        biomeRegion({ temperature: [4, 4], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [1, 4] }),
        biomeRegion({ temperature: [4, 4], humidity: [4, 4], continentalness: [3, 3], erosion: [5, 5], weirdness: [1, 1], PV: [1, 2] }),
        biomeRegion({ temperature: [4, 4], humidity: [4, 4], continentalness: [4, 4], erosion: [5, 5], PV: [1, 2] }),
        biomeRegion({ temperature: [4, 4], continentalness: [5, 6], erosion: [5, 5], PV: [1, 4] }),
        biomeRegion({ temperature: [4, 4], humidity: [4, 4], continentalness: [3, 4], erosion: [5, 5], PV: [3, 4] }),
        biomeRegion({ temperature: [4, 4], continentalness: [3, 3], erosion: [6, 6], PV: [1, 2] }),
        biomeRegion({ temperature: [4, 4], continentalness: [3, 6], erosion: [6, 6], PV: [3, 4] })
    ]
})
const Savanna: Biome = biome({
    id: BIOME.SAVANNA,
    regions: [
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [5, 6], erosion: [0, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [4, 4], erosion: [0, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [3, 3], erosion: [0, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [4, 5], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [4, 4], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [3, 4], erosion: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [5, 6], erosion: [2, 3], PV: [1, 1] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [3, 4], erosion: [2, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [3, 6], erosion: [3, 3], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [5, 5], erosion: [3, 3], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [4, 6], erosion: [4, 4], PV: [1, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [3, 3], erosion: [4, 4], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [3, 6], erosion: [4, 4], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [4, 4], erosion: [5, 5], weirdness: [0, 0], PV: [1, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [5, 6], erosion: [5, 5], PV: [1, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [3, 4], erosion: [5, 5], weirdness: [0, 0], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [3, 3], erosion: [6, 6], weirdness: [1, 1], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [3, 6], erosion: [6, 6], PV: [3, 4] })
    ]
})
const SavannaPlateau: Biome = biome({
    id: BIOME.SAVANNA_PLATEAU,
    regions: [
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [4, 6], erosion: [0, 0], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [4, 4], erosion: [0, 0], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [6, 6], erosion: [1, 2], PV: [2, 2] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [5, 6], erosion: [1, 1], PV: [3, 3] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [5, 6], erosion: [2, 2], PV: [3, 4] }),
        biomeRegion({ temperature: [3, 3], humidity: [0, 1], continentalness: [6, 6], erosion: [3, 3], PV: [3, 4] })
    ]
})
const WindsweptSavanna: Biome = biome({
    id: BIOME.WINDSWEPT_SAVANNA,
    regions: [
        biomeRegion({ temperature: [2, 4], humidity: [0, 3], continentalness: [3, 4], erosion: [5, 5], weirdness: [1, 1], PV: [1, 4] })
    ]
})
const Badlands: Biome = biome({
    id: BIOME.BADLANDS,
    regions: [
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [5, 6], erosion: [0, 1], weirdness: [0, 0], PV: [0, 1] }),
        biomeRegion({ temperature: [4, 4], humidity: [2, 2], continentalness: [5, 6], erosion: [0, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [4, 4], erosion: [0, 1], weirdness: [0, 0], PV: [1, 1] }),
        biomeRegion({ temperature: [4, 4], humidity: [2, 2], continentalness: [4, 4], erosion: [0, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [4, 6], erosion: [0, 1], weirdness: [0, 0], PV: [2, 3] }),
        biomeRegion({ temperature: [4, 4], humidity: [2, 2], continentalness: [4, 6], erosion: [0, 1], PV: [2, 3] }),
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [3, 6], erosion: [0, 1], weirdness: [0, 0], PV: [4, 4] }),
        biomeRegion({ temperature: [4, 4], humidity: [2, 2], continentalness: [3, 6], erosion: [0, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [5, 6], erosion: [2, 3], weirdness: [0, 0], PV: [1, 4] }),
        biomeRegion({ temperature: [4, 4], humidity: [2, 2], continentalness: [5, 6], erosion: [2, 3], PV: [1, 4] })
    ]
})
const WoodedBadlands: Biome = biome({
    id: BIOME.WOODED_BADLANDS,
    regions: [
        biomeRegion({ temperature: [4, 4], humidity: [3, 4], continentalness: [5, 6], erosion: [0, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [4, 4], humidity: [3, 4], continentalness: [4, 4], erosion: [0, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [4, 4], humidity: [3, 4], continentalness: [4, 6], erosion: [0, 1], PV: [2, 3] }),
        biomeRegion({ temperature: [4, 4], humidity: [3, 4], continentalness: [3, 6], erosion: [0, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [4, 4], humidity: [3, 4], continentalness: [5, 6], erosion: [2, 3], PV: [1, 4] })
    ]
})
const ErodedBadlands: Biome = biome({
    id: BIOME.ERODED_BADLANDS,
    regions: [
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [5, 6], erosion: [0, 1], weirdness: [1, 1], PV: [0, 1] }),
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [4, 4], erosion: [0, 1], weirdness: [1, 1], PV: [1, 1] }),
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [4, 6], erosion: [0, 1], weirdness: [1, 1], PV: [2, 3] }),
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [3, 6], erosion: [0, 1], weirdness: [1, 1], PV: [4, 4] }),
        biomeRegion({ temperature: [4, 4], humidity: [0, 1], continentalness: [5, 6], erosion: [2, 3], weirdness: [1, 1], PV: [1, 4] })
    ]
})
