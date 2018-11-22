import {Entity} from "../entity/Entity";
import {Block} from "./Block";

export class Chunk {
    private x: number;
    private z: number;
    private sections: Section[] = [];
    private entites: Entity[];

    constructor() {
        for (let i = 0; i < 16; i++)
            this.sections[i] = new Section();
    }

    getX(): number {
        return this.x;
    }

    getZ(): number {
        return this.z;
    }

    getBlock(x: number, y: number, z: number): Block {
        return this.sections[Math.floor(y / 256)].getBlock(x, y % 16, z);
    }

    setBlock(x: number, y: number, z: number, block: Block) {
        this.sections[Math.floor(y / 256)].setBlock(x, y % 16, z, block);
    }

    getEntities(): Entity[] {
        return this.entites;
    }
}

class Section {
    private blocks: Block[] = [];

    constructor() {
        for (let i = 0; i < 16; i++)
            this.blocks[i] = new Block(0);
    }

    getBlock(x: number, y: number, z: number): Block {
        return this.blocks[(y * 16 + z) * 16 + x];
    }

    setBlock(x: number, y: number, z: number, block: Block) {
        this.blocks[(y * 16 + z) * 16 + x] = block;
    }
}
