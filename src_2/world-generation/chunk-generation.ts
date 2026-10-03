import { Chunk, CHUNK_SIZE } from "../../src/world/chunk";

class ChunkGenerator {
    biomeMap: BiomeMap = new BiomeMap();

    // generates a new chunk
    generate(): Chunk {}

    // stage-specific generators
    private biomes(ch: Chunk) {
        const x0 = ch.cx * CHUNK_SIZE, z0 = ch.cz * CHUNK_SIZE;
        for (let sz = 0; sz < CHUNK_SIZE; sz++)
            for (let sx = 0; sx < CHUNK_SIZE; sx++)
                ch.biomes[(sx, sz)] = this.biomeMap.at(x0 + sx, z0 + sz);
    }
    
    private terrain() {}
    private surface() {}
    private carvers() {}
    private features() {}
}