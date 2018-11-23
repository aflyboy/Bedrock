import {Chunk} from "../base/Chunk";
import {Block} from "../base/Block";

export class World {
    private readonly seed: string;

    constructor(seed: string) {
        this.seed = seed;
    }

    public generateChunk(x: number, z: number): Chunk {
        let chunk = new Chunk(x, z);
        let twister = new MT32(this.seed);
        twister.extractNumber();
        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                chunk.setBlock(x, 0, z, new Block(7)); // bedrock
            }
        }
        chunk.setBlock(2, 1, 2, new Block(7)); // bedrock
        chunk.setBlock(3, 1, 2, new Block(7)); // bedrock
        chunk.setBlock(4, 1, 2, new Block(7)); // bedrock
        chunk.setBlock(3, 1, 3, new Block(7)); // bedrock

        return chunk;
    }
}

class MT32 {
    private mt = {};
    private index: number;

    constructor(seed: string) {
        this.mt[0] = seed;
        this.index = 0;

        for (let i = 1; i < 624; i++)
            this.mt[i] = 1812433253 * (this.mt[i - 1] ^ this.mt[i - 1] >> 30) + i;

        for (let i = 0; i < 624; i++) {
            let y = (this.mt[i] & 0x80000000) + (this.mt[(i + 1) % 624] & 0x7fffffff);
            this.mt[i] = y ^ this.mt[(i + 397) % 624] >> 1;

            if (y % 2 != 0)
                this.mt[i] = this.mt[i] ^ 0x9908b0df;
        }
    }

    extractNumber(): number {
        let y = this.mt[this.index];
        y = y ^ y >> 11;
        y = y ^ y << 7 & 2636928640;
        y = y ^ y << 15 & 4022730752;
        y = y ^ y >> 18;

        this.index = (this.index + 1) % 624;

        return y;
    }
}
