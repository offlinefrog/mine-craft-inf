const BIOME = {
    OCEAN: 0,
    DEEP_OCEAN: 1,
    WARM_OCEAN: 2,
    LUKEWARM_OCEAN: 3,
    DEEP_LUKEWARM_OCEAN: 4,
    COLD_OCEAN: 5,
    DEEP_COLD_OCEAN: 6,
    FROZEN_OCEAN: 7,
    DEEP_FROZEN_OCEAN: 8,
    MUSHROOM_FIELDS: 9,

    JAGGED_PEAKS: 10,
    FROZEN_PEAKS: 11,
    STONY_PEAKS: 12,

    MEADOW: 13,
    CHERRY_GROVE: 14,

    GROVE: 15,
    SNOWY_SLOPES: 16
} as const;
type BiomeID = typeof BIOME[keyof typeof BIOME];

const CLIMATE_PARAMS = [
    'temperature', 'humidity', 'continentalness', 'erosion', 'weirdness', 'pv'
] as const;
type ClimateParam = (typeof CLIMATE_PARAMS)[number];
type ClimateConstraint = number | [number, number];

type ClimateRegion = Partial<Record<ClimateParam, ClimateConstraint>>;
type ClimateSpace = ClimateRegion[];

interface Biome {
    readonly id: BiomeID;
    readonly climateSpace: ClimateSpace;

    registerSpace(biomes: Record<BiomeID, ClimateSpace>): void;     // registers biome to biomes
}

class JaggedPeaks implements Biome {
    readonly id = BIOME.JAGGED_PEAKS;
    readonly climateSpace: ClimateSpace = [
        { continentalness: [5, 6], erosion: 0, pv: 3 },
        { continentalness: [5, 6], erosion: 0, pv: 4 },
        { continentalness: [5, 6], erosion: 1, pv: 4 }
    ]

    registerSpace(biomes: Partial<Record<BiomeID, ClimateSpace>>): void {
        biomes[this.id] = this.climateSpace.map(region => ({
            ...region,
            temperature: [0, 2],
            weirdness: 0,
        }));
        
    }
}