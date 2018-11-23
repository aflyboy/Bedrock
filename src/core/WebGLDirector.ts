import * as THREE from "three"
import {Chunk} from "../base/Chunk";
import {IControls} from "../controls/IControls";
import {Constants} from "../Constants";

export class WebGLDirector {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private controls: IControls;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.initComponents();
    }

    protected initComponents() {
    }

    public renderRegion(chunks: Chunk[]) {
        let light = new THREE.Color(0xffffff);
        let shadow = new THREE.Color(0x505050);

        // RIGHT
        let pxGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
        pxGeometry.faces[0].vertexColors = [light, shadow, light];
        pxGeometry.faces[1].vertexColors = [shadow, shadow, light];
        pxGeometry.faceVertexUvs[0][0][0].y = 0.5;
        pxGeometry.faceVertexUvs[0][0][2].y = 0.5;
        pxGeometry.faceVertexUvs[0][1][2].y = 0.5;
        pxGeometry.rotateY(Math.PI / 2);
        pxGeometry.translate(Constants.BLOCK_SIZE / 2, 0, 0);

        // LEFT
        let nxGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
        nxGeometry.faces[0].vertexColors = [light, shadow, light];
        nxGeometry.faces[1].vertexColors = [shadow, shadow, light];
        nxGeometry.faceVertexUvs[0][0][0].y = 0.5;
        nxGeometry.faceVertexUvs[0][0][2].y = 0.5;
        nxGeometry.faceVertexUvs[0][1][2].y = 0.5;
        nxGeometry.rotateY(-Math.PI / 2);
        nxGeometry.translate(-Constants.BLOCK_SIZE / 2, 0, 0);

        // TOP
        let pyGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
        pyGeometry.faces[0].vertexColors = [light, light, light];
        pyGeometry.faces[1].vertexColors = [light, light, light];
        pyGeometry.faceVertexUvs[0][0][1].y = 0.5;
        pyGeometry.faceVertexUvs[0][1][0].y = 0.5;
        pyGeometry.faceVertexUvs[0][1][1].y = 0.5;
        pyGeometry.rotateX(-Math.PI / 2);
        pyGeometry.translate(0, Constants.BLOCK_SIZE / 2, 0);

        // BOTTOM
        let nyGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
        nyGeometry.faces[0].vertexColors = [light, light, light];
        nyGeometry.faces[1].vertexColors = [light, light, light];
        nyGeometry.faceVertexUvs[0][0][1].y = 0.5;
        nyGeometry.faceVertexUvs[0][1][0].y = 0.5;
        nyGeometry.faceVertexUvs[0][1][1].y = 0.5;
        nyGeometry.rotateX(-Math.PI / 2);
        nyGeometry.translate(0, -Constants.BLOCK_SIZE / 2, 0);

        // FRONT
        let pzGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
        pzGeometry.faces[0].vertexColors = [light, shadow, light];
        pzGeometry.faces[1].vertexColors = [shadow, shadow, light];
        pzGeometry.faceVertexUvs[0][0][0].y = 0.5;
        pzGeometry.faceVertexUvs[0][0][2].y = 0.5;
        pzGeometry.faceVertexUvs[0][1][2].y = 0.5;
        pzGeometry.translate(0, 0, Constants.BLOCK_SIZE / 2);

        // BACK
        let nzGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
        nzGeometry.faces[0].vertexColors = [light, shadow, light];
        nzGeometry.faces[1].vertexColors = [shadow, shadow, light];
        nzGeometry.faceVertexUvs[0][0][0].y = 0.5;
        nzGeometry.faceVertexUvs[0][0][2].y = 0.5;
        nzGeometry.faceVertexUvs[0][1][2].y = 0.5;
        nzGeometry.rotateY(Math.PI);
        nzGeometry.translate(0, 0, -Constants.BLOCK_SIZE / 2);

        let texture1 = new THREE.TextureLoader().load("assets/textures/atlas.png");
        let texture2 = new THREE.TextureLoader().load("assets/textures/dirt.png");

        // let geometries = [];
        let objects = [];
        for (let i = 0; i < chunks.length; i++) {
            for (let z = 0; z < 16; z++) {
                for (let x = 0; x < 16; x++) {
                    for (let y = 0; y < 16; y++) {
                        let xx = chunks[i].getX() * 16;
                        let zz = chunks[i].getZ() * 16;

                        let block = chunks[i].getBlock(x, y, z);
                        if (block.getId() == 0) continue;

                        let geometry = new THREE.Geometry();

                        let matrix = new THREE.Matrix4();
                        matrix.makeTranslation((x + xx) * Constants.BLOCK_SIZE - 16 * Constants.BLOCK_SIZE, y * Constants.BLOCK_SIZE, (z + zz) * Constants.BLOCK_SIZE - 16 * Constants.BLOCK_SIZE);

                        if (!chunks[i].isNearBlock(x, y, z, x, y + 1, z))
                            geometry.merge(pyGeometry, matrix);

                        if (!chunks[i].isNearBlock(x, y, z, x, y - 1 >= 0 ? y - 1 : 0, z))
                            geometry.merge(nyGeometry, matrix);

                        if (!chunks[i].isNearBlock(x, y, z, x + 1, y, z))
                            geometry.merge(pxGeometry, matrix);

                        if (!chunks[i].isNearBlock(x, y, z, x - 1 >= 0 ? x - 1 : 0, y, z))
                            geometry.merge(nxGeometry, matrix);

                        if (!chunks[i].isNearBlock(x, y, z, x, y, z + 1))
                            geometry.merge(pzGeometry, matrix);

                        if (!chunks[i].isNearBlock(x, y, z, x, y, z - 1 >= 0 ? z - 1 : 0))
                            geometry.merge(nzGeometry, matrix);

                        geometry = new THREE.BufferGeometry().fromGeometry(geometry);

                        let texture = texture1;
                        if (block.getId() == 12)
                            texture = texture2;

                        texture.magFilter = THREE.NearestFilter;
                        texture.minFilter = THREE.LinearMipMapLinearFilter;

                        let mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({map: texture, vertexColors: THREE.VertexColors, side: THREE.DoubleSide}));
                        this.scene.add(mesh);

                        objects.push(mesh);
                    }
                }
            }
        }


        let ambientLight = new THREE.AmbientLight(0xaaaaaa);
        this.scene.add(ambientLight);

        let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(1, 1, 0.5).normalize();
        this.scene.add(directionalLight);

        return objects;
    }

    public setController(controls: IControls): void {
        this.controls = controls;
    }
}
