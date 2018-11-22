import * as THREE from "three"

export class WebVRGame {
    private scene: THREE.Scene;
    private camera: THREE.Camera;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;
    }
}
