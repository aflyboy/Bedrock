import * as THREE from "three"

export class WebGLGame {
    private scene: THREE.Scene;
    private camera: THREE.Camera;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.initComponents();
    }

    protected initComponents() {
    }

    public renderRegion() {
        let matrix = new THREE.Matrix4();

        let pxGeometry = new THREE.PlaneBufferGeometry(100, 100);
        pxGeometry.attributes.uv.array[1] = 0.5;
        pxGeometry.attributes.uv.array[3] = 0.5;
        pxGeometry.rotateY(Math.PI / 2);
        pxGeometry.translate(50, 0, 0);

        let nxGeometry = new THREE.PlaneBufferGeometry(100, 100);
        nxGeometry.attributes.uv.array[1] = 0.5;
        nxGeometry.attributes.uv.array[3] = 0.5;
        nxGeometry.rotateY(-Math.PI / 2);
        nxGeometry.translate(-50, 0, 0);

        let pyGeometry = new THREE.PlaneBufferGeometry(100, 100);
        pyGeometry.attributes.uv.array[5] = 0.5;
        pyGeometry.attributes.uv.array[7] = 0.5;
        pyGeometry.rotateX(-Math.PI / 2);
        pyGeometry.translate(0, 50, 0);

        let pzGeometry = new THREE.PlaneBufferGeometry(100, 100);
        pzGeometry.attributes.uv.array[1] = 0.5;
        pzGeometry.attributes.uv.array[3] = 0.5;
        pzGeometry.translate(0, 0, 50);

        let nzGeometry = new THREE.PlaneBufferGeometry(100, 100);
        nzGeometry.attributes.uv.array[1] = 0.5;
        nzGeometry.attributes.uv.array[3] = 0.5;
        nzGeometry.rotateY(Math.PI);
        nzGeometry.translate(0, 0, -50);

        let geometries = [];
        for (let z = 0; z < 16; z++) {
            for (let x = 0; x < 16; x++) {
                let y = 0;

                matrix.makeTranslation(x * 100 - 16 * 100, y * 100, z * 100 - 16 * 100);

                geometries.push(pyGeometry.clone().applyMatrix(matrix));
            }
        }

        let geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);

        geometry.computeBoundingSphere();

        let texture = new THREE.TextureLoader().load('assets/textures/dirt.png');
        texture.magFilter = THREE.NearestFilter;

        let mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({map: texture, side: THREE.DoubleSide}));
        this.scene.add(mesh);

        let objects = [];
        objects.push(mesh);

        let ambientLight = new THREE.AmbientLight(0xcccccc);
        this.scene.add(ambientLight);

        let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(1, 1, 0.5).normalize();
        this.scene.add(directionalLight);

        return objects;
    }
}
