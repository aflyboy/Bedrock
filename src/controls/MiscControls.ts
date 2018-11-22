import * as THREE from "three"

let controls: THREE.PointerLockControls;

export class MiscControls {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private raycaster: THREE.Raycaster;

    private objects: [];

    private prevTime: number = performance.now();
    private velocity: THREE.Vector3 = new THREE.Vector3();
    private direction: THREE.Vector3 = new THREE.Vector3();

    private static moveForward: boolean = false;
    private static moveBackward: boolean = false;
    private static moveLeft: boolean = false;
    private static moveRight: boolean = false;
    private static handleJump: boolean = false;
    private static canJump: boolean = false;

    constructor(scene: THREE.Scene, camera: THREE.Camera, objects: []) {
        this.scene = scene;
        this.camera = camera;
        this.objects = objects;

        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

        controls = new THREE.PointerLockControls(camera);
        this.scene.add(controls.getObject());

        document.addEventListener("click", MiscControls.onDocumentClick, false);
        document.addEventListener("keydown", MiscControls.onDocumentKeyDown, false);
        document.addEventListener("keyup", MiscControls.onDocumentKeyUp, false);
    }

    public update(): void {
        if (MiscControls.handleJump) {
            this.velocity.y += 500;
            MiscControls.handleJump = false;
        }

        this.raycaster.ray.origin.copy(controls.getObject().position);
        this.raycaster.ray.origin.y -= 10;

        let intersections = this.raycaster.intersectObjects(this.objects);
        let onObject = intersections.length > 0;

        let time = performance.now();
        let delta = (time - this.prevTime) / 1000;

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.velocity.y -= 9.8 * 100.0 * delta;

        this.direction.z = Number(MiscControls.moveForward) - Number(MiscControls.moveBackward);
        this.direction.x = Number(MiscControls.moveLeft) - Number(MiscControls.moveRight);
        this.direction.normalize();

        if (MiscControls.moveForward || MiscControls.moveBackward) this.velocity.z -= this.direction.z * 250.0 * delta * 10;
        if (MiscControls.moveLeft || MiscControls.moveRight) this.velocity.x -= this.direction.x * 250.0 * delta * 10;

        if (onObject == true) {
            this.velocity.y = Math.max(0, this.velocity.y);
            MiscControls.canJump = true;
        }

        controls.getObject().translateX(this.velocity.x * delta);
        controls.getObject().translateY(this.velocity.y * delta);
        controls.getObject().translateZ(this.velocity.z * delta);

        if (controls.getObject().position.y < 10) {
            this.velocity.y = 0;
            controls.getObject().position.y = 10;

            MiscControls.canJump = true;
        }

        this.prevTime = time;
    }

    public static onDocumentKeyDown(evt): void {
        let keyCode = evt.keyCode || evt.which;

        switch (keyCode) {
            case 87:
                MiscControls.moveForward = true;
                break;
            case 65:
                MiscControls.moveLeft = true;
                break;
            case 83:
                MiscControls.moveBackward = true;
                break;
            case 68:
                MiscControls.moveRight = true;
                break;
            case 32:
                if (MiscControls.canJump) {
                    MiscControls.handleJump = true;
                    MiscControls.canJump = false;
                }
                break;
        }
    }


    public static onDocumentKeyUp(evt): void {
        let keyCode = evt.keyCode || evt.which;

        switch (keyCode) {
            case 87:
                MiscControls.moveForward = false;
                break;
            case 65:
                MiscControls.moveLeft = false;
                break;
            case 83:
                MiscControls.moveBackward = false;
                break;
            case 68:
                MiscControls.moveRight = false;
                break;
        }
    }

    public static onDocumentClick(): void {
        controls.lock();
    }
}
