import {Entity} from "../entity/Entity";
import {Block} from "./Block";

export class Chunk {
    private x: number;
    private z: number;
    private sections: Section[] = [];
    private entites: Entity[];

    constructor(x, z) {
        this.x = x;
        this.z = z;

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

    isNearBlock(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): boolean {
        return this.sections[Math.floor(y1 / 256)].hasBlock(x1, y1 % 16, z1) && this.sections[Math.floor(y2 / 256)].hasBlock(x2, y2 % 16, z2);
    }
}

class Section {
    private blocks: Block[] = [];

    constructor() {
        for (let i = 0; i < 4096; i++)
            this.blocks[i] = new Block(0);
    }

    getBlock(x: number, y: number, z: number): Block {
        return this.blocks[(y * 16 + z) * 16 + x];
    }

    setBlock(x: number, y: number, z: number, block: Block): void {
        this.blocks[(y * 16 + z) * 16 + x] = block;
    }

    hasBlock(x: number, y: number, z: number): boolean {
        return this.blocks[(y * 16 + z) * 16 + x].getId() != 0;
    }
}
