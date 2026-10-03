import { BIOME, biomeSpace, type Biome } from "./biome"

const Ocean: Biome = {
    id: BIOME.OCEAN,
    regions: [biomeSpace({ temperature: [2, 2], continentalness: [2, 2] })]
}
const DeepOcean: Biome = {
    id: BIOME.DEEP_OCEAN,
    regions: [biomeSpace({ temperature: [2, 2], continentalness: [1, 1] })]
}
const WarmOcean: Biome = {
    id: BIOME.WARM_OCEAN,
    regions: [biomeSpace({ temperature: [4, 4], continentalness: [1, 2] })]
}
const LukewarmOcean: Biome = {
    id: BIOME.LUKEWARM_OCEAN,
    regions: [biomeSpace({ temperature: [3, 3], continentalness: [2, 2] })]
}
const DeepLukewarmOcean: Biome = {
    id: BIOME.DEEP_LUKEWARM_OCEAN,
    regions: [biomeSpace({ temperature: [3, 3], continentalness: [1, 1] })]
}
const ColdOcean: Biome = {
    id: BIOME.COLD_OCEAN,
    regions: [biomeSpace({ temperature: [1, 1], continentalness: [2, 2] })]
}
const DeepColdOcean: Biome = {
    id: BIOME.DEEP_COLD_OCEAN,
    regions: [biomeSpace({ temperature: [1, 1], continentalness: [1, 1] })]
}
const FrozenOcean: Biome = {
    id: BIOME.FROZEN_OCEAN,
    regions: [biomeSpace({ temperature: [0, 0], continentalness: [2, 2] })]
}
const DeepFrozenOcean: Biome = {
    id: BIOME.DEEP_FROZEN_OCEAN,
    regions: [biomeSpace({ temperature: [0, 0], continentalness: [1, 1] })]
}
const MushroomFields: Biome = {
    id: BIOME.MUSHROOM_FIELDS,
    regions: [biomeSpace({ continentalness: [0, 0] })]
}

export const OCEAN_BIOMES = [
    Ocean, DeepOcean,
    WarmOcean,
    LukewarmOcean, DeepLukewarmOcean,
    ColdOcean, DeepColdOcean,
    FrozenOcean, DeepFrozenOcean,
    MushroomFields
]

const JaggedPeaks: Biome = {
    id: BIOME.JAGGED_PEAKS,
    regions: [
        biomeSpace({
            temperature: [0, 2],
            continentalness: [5, 6],
            erosion: [0, 0],
            weirdness: [0, 0],
            peaksValleys: [3, 3],
        }),
        biomeSpace({
            temperature: [0, 2],
            continentalness: [3, 6],
            erosion: [0, 0],
            weirdness: [0, 0],
            peaksValleys: [4, 4],
        }),
        biomeSpace({
            temperature: [0, 2],
            continentalness: [5, 6],
            erosion: [1, 1],
            weirdness: [0, 0],
            peaksValleys: [4, 4],
        }),
    ]
}
const FrozenPeaks: Biome = {
    id: BIOME.FROZEN_PEAKS,
    regions: [
        biomeSpace({
            temperature: [0, 2],
            continentalness: [5, 6],
            erosion: [0, 0],
            weirdness: [1, 1],
            peaksValleys: [3, 3],
        }),
        biomeSpace({
            temperature: [0, 2],
            continentalness: [3, 6],
            erosion: [0, 0],
            weirdness: [1, 1],
            peaksValleys: [4, 4],
        }),
        biomeSpace({
            temperature: [0, 2],
            continentalness: [5, 6],
            erosion: [1, 1],
            weirdness: [1, 1],
            peaksValleys: [4, 4],
        }),
    ]
}
const StonyPeaks: Biome = {
    id: BIOME.STONY_PEAKS,
    regions: [
        biomeSpace({
            temperature: [3, 3],
            continentalness: [5, 6],
            erosion: [0, 0],
            peaksValleys: [3, 3],
        }),
        biomeSpace({
            temperature: [3, 3],
            continentalness: [3, 6],
            erosion: [0, 0],
            peaksValleys: [4, 4],
        }),
        biomeSpace({
            temperature: [3, 3],
            continentalness: [5, 6],
            erosion: [1, 1],
            peaksValleys: [4, 4],
        }),
    ]
}

const Meadow: Biome = {
    id: BIOME.MEADOW,
    regions: [
        biomeSpace({
            temperature: [1, 1],
            humidity: [0, 0],
            weirdness: [0, 0]
        }),
    ]
}

const CherryGrove: Biome = {
    id: BIOME.CHERRY_GROVE,
    regions: [
        biomeSpace({
            temperature: [1, 1],
            humidity: [0, 0],
            continentalness: [6, 6],
            erosion: [1, 1],
            weirdness: [0, 0],
            peaksValleys: [2, 2]
        }),
        biomeSpace({
            temperature: [1, 1],
            humidity: [0, 0],
            continentalness: [6, 6],
            erosion: [2, 2],
            weirdness: [0, 0],
            peaksValleys: [2, 2]
        }),
        biomeSpace({
            temperature: [1, 1],
            humidity: [0, 0],
            continentalness: [5, 6],
            erosion: [2, 2],
            weirdness: [0, 0],
            peaksValleys: [3, 4]
        }),
        biomeSpace({
            temperature: [1, 1],
            humidity: [0, 0],
            continentalness: [6, 6],
            erosion: [3, 3],
            weirdness: [0, 0],
            peaksValleys: [3, 4]
        }),
    ]
};

const Grove: Biome = {
    id: BIOME.GROVE,
    regions: [
        biomeSpace({
            temperature: [0, 0],
            continentalness: [3, 6],
        }),
    ],
};

const SnowySlopes: Biome = {
    id: BIOME.SNOWY_SLOPES,
    regions: [
        biomeSpace({
            temperature: [0, 0],
            humidity: [0, 1],
            continentalness: [5, 6],
            erosion: [0, 1],
            peaksValleys: [1, 3],
        }),
    ],
};