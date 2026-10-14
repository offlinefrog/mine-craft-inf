import { BIOME_NAMES, BIOME_PROPS, biomeID, type Biome, type BiomeID, type BiomeName, type BiomeProps } from "./biomes";

export class BiomeRegistry {
    readonly biomes: readonly Biome[];

    constructor(props: Readonly<Record<BiomeName, BiomeProps>> = BIOME_PROPS) {
        this.biomes = BIOME_NAMES.map((name): Biome => {
            const p = props[name];
            return {
                id: biomeID(name),
                name,
                temperature: p.temperature,
                downfall: p.downfall
            };
        });
    }

    index(id: BiomeID): Biome { return this.biomes[id - 1]!; }
    name(name: BiomeName): Biome { return this.biomes[biomeID(name) - 1]!; }

    get all(): readonly Biome[] { return this.biomes; }
}
