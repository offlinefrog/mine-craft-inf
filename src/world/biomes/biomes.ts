import { BIOME, biomeRegion, type Biome } from "./biome"

const Ocean: Biome = {
    id: BIOME.OCEAN,
    regions: [biomeRegion({ temperature: [2, 2], continentalness: [2, 2] })]
}
const DeepOcean: Biome = {
    id: BIOME.DEEP_OCEAN,
    regions: [biomeRegion({ temperature: [2, 2], continentalness: [1, 1] })]
}
const WarmOcean: Biome = {
    id: BIOME.WARM_OCEAN,
    regions: [biomeRegion({ temperature: [4, 4], continentalness: [1, 2] })]
}
const LukewarmOcean: Biome = {
    id: BIOME.LUKEWARM_OCEAN,
    regions: [biomeRegion({ temperature: [3, 3], continentalness: [2, 2] })]
}
const DeepLukewarmOcean: Biome = {
    id: BIOME.DEEP_LUKEWARM_OCEAN,
    regions: [biomeRegion({ temperature: [3, 3], continentalness: [1, 1] })]
}
const ColdOcean: Biome = {
    id: BIOME.COLD_OCEAN,
    regions: [biomeRegion({ temperature: [1, 1], continentalness: [2, 2] })]
}
const DeepColdOcean: Biome = {
    id: BIOME.DEEP_COLD_OCEAN,
    regions: [biomeRegion({ temperature: [1, 1], continentalness: [1, 1] })]
}
const FrozenOcean: Biome = {
    id: BIOME.FROZEN_OCEAN,
    regions: [biomeRegion({ temperature: [0, 0], continentalness: [2, 2] })]
}
const DeepFrozenOcean: Biome = {
    id: BIOME.DEEP_FROZEN_OCEAN,
    regions: [biomeRegion({ temperature: [0, 0], continentalness: [1, 1] })]
}
const MushroomFields: Biome = {
    id: BIOME.MUSHROOM_FIELDS,
    regions: [biomeRegion({ continentalness: [0, 0] })]
}
