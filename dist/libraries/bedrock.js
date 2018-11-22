(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
    typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
    (factory((global.Bedrock = {}),global.THREE));
}(this, (function (exports,THREE) { 'use strict';

    var Block = (function () {
        function Block(id) {
            this.id = id;
        }
        return Block;
    }());

    var Chunk = (function () {
        function Chunk() {
            this.sections = [];
            for (var i = 0; i < 16; i++)
                this.sections[i] = new Section();
        }
        Chunk.prototype.getX = function () {
            return this.x;
        };
        Chunk.prototype.getZ = function () {
            return this.z;
        };
        Chunk.prototype.getBlock = function (x, y, z) {
            return this.sections[Math.floor(y / 256)].getBlock(x, y % 16, z);
        };
        Chunk.prototype.setBlock = function (x, y, z, block) {
            this.sections[Math.floor(y / 256)].setBlock(x, y % 16, z, block);
        };
        Chunk.prototype.getEntities = function () {
            return this.entites;
        };
        return Chunk;
    }());
    var Section = (function () {
        function Section() {
            this.blocks = [];
            for (var i = 0; i < 16; i++)
                this.blocks[i] = new Block(0);
        }
        Section.prototype.getBlock = function (x, y, z) {
            return this.blocks[(y * 16 + z) * 16 + x];
        };
        Section.prototype.setBlock = function (x, y, z, block) {
            this.blocks[(y * 16 + z) * 16 + x] = block;
        };
        return Section;
    }());

    var Entity = (function () {
        function Entity() {
            alert("AAA");
        }
        return Entity;
    }());

    var WebGLGame = (function () {
        function WebGLGame(scene, camera) {
            this.scene = scene;
            this.camera = camera;
            this.initComponents();
        }
        WebGLGame.prototype.initComponents = function () {
        };
        WebGLGame.prototype.renderRegion = function () {
            var matrix = new THREE.Matrix4();
            var pxGeometry = new THREE.PlaneBufferGeometry(100, 100);
            pxGeometry.attributes.uv.array[1] = 0.5;
            pxGeometry.attributes.uv.array[3] = 0.5;
            pxGeometry.rotateY(Math.PI / 2);
            pxGeometry.translate(50, 0, 0);
            var nxGeometry = new THREE.PlaneBufferGeometry(100, 100);
            nxGeometry.attributes.uv.array[1] = 0.5;
            nxGeometry.attributes.uv.array[3] = 0.5;
            nxGeometry.rotateY(-Math.PI / 2);
            nxGeometry.translate(-50, 0, 0);
            var pyGeometry = new THREE.PlaneBufferGeometry(100, 100);
            pyGeometry.attributes.uv.array[5] = 0.5;
            pyGeometry.attributes.uv.array[7] = 0.5;
            pyGeometry.rotateX(-Math.PI / 2);
            pyGeometry.translate(0, 50, 0);
            var pzGeometry = new THREE.PlaneBufferGeometry(100, 100);
            pzGeometry.attributes.uv.array[1] = 0.5;
            pzGeometry.attributes.uv.array[3] = 0.5;
            pzGeometry.translate(0, 0, 50);
            var nzGeometry = new THREE.PlaneBufferGeometry(100, 100);
            nzGeometry.attributes.uv.array[1] = 0.5;
            nzGeometry.attributes.uv.array[3] = 0.5;
            nzGeometry.rotateY(Math.PI);
            nzGeometry.translate(0, 0, -50);
            var geometries = [];
            for (var z = 0; z < 16; z++) {
                for (var x = 0; x < 16; x++) {
                    var y = 0;
                    matrix.makeTranslation(x * 100 - 16 * 100, y * 100, z * 100 - 16 * 100);
                    geometries.push(pyGeometry.clone().applyMatrix(matrix));
                }
            }
            var geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
            geometry.computeBoundingSphere();
            var texture = new THREE.TextureLoader().load('assets/textures/dirt.png');
            texture.magFilter = THREE.NearestFilter;
            var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }));
            this.scene.add(mesh);
            var objects = [];
            objects.push(mesh);
            var ambientLight = new THREE.AmbientLight(0xcccccc);
            this.scene.add(ambientLight);
            var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
            directionalLight.position.set(1, 1, 0.5).normalize();
            this.scene.add(directionalLight);
            return objects;
        };
        return WebGLGame;
    }());

    var WebVRGame = (function () {
        function WebVRGame(scene, camera) {
            this.scene = scene;
            this.camera = camera;
        }
        return WebVRGame;
    }());

    var World = (function () {
        function World(seed) {
            this.seed = seed;
        }
        World.prototype.generateChunk = function (x, z) {
            var chunk = new Chunk();
            var twister = new MT32(this.seed);
            twister.extractNumber();
            for (var x_1 = 0; x_1 < 16; x_1++) {
                for (var z_1 = 0; z_1 < 16; z_1++) {
                    chunk.setBlock(x_1, 0, z_1, new Block(7));
                    chunk.setBlock(x_1, 1, z_1, new Block(12));
                }
            }
            return chunk;
        };
        return World;
    }());
    var MT32 = (function () {
        function MT32(seed) {
            this.mt = {};
            this.mt[0] = seed;
            this.index = 0;
            for (var i = 1; i < 624; i++)
                this.mt[i] = 1812433253 * (this.mt[i - 1] ^ this.mt[i - 1] >> 30) + i;
            for (var i = 0; i < 624; i++) {
                var y = (this.mt[i] & 0x80000000) + (this.mt[(i + 1) % 624] & 0x7fffffff);
                this.mt[i] = y ^ this.mt[(i + 397) % 624] >> 1;
                if (y % 2 != 0)
                    this.mt[i] = this.mt[i] ^ 0x9908b0df;
            }
        }
        MT32.prototype.extractNumber = function () {
            var y = this.mt[this.index];
            y = y ^ y >> 11;
            y = y ^ y << 7 & 2636928640;
            y = y ^ y << 15 & 4022730752;
            y = y ^ y >> 18;
            this.index = (this.index + 1) % 624;
            return y;
        };
        return MT32;
    }());

    var controls;
    var MiscControls = (function () {
        function MiscControls(scene, camera, objects) {
            this.prevTime = performance.now();
            this.velocity = new THREE.Vector3();
            this.direction = new THREE.Vector3();
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
        MiscControls.prototype.update = function () {
            if (MiscControls.handleJump) {
                this.velocity.y += 500;
                MiscControls.handleJump = false;
            }
            this.raycaster.ray.origin.copy(controls.getObject().position);
            this.raycaster.ray.origin.y -= 10;
            var intersections = this.raycaster.intersectObjects(this.objects);
            var onObject = intersections.length > 0;
            var time = performance.now();
            var delta = (time - this.prevTime) / 1000;
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= 9.8 * 100.0 * delta;
            this.direction.z = Number(MiscControls.moveForward) - Number(MiscControls.moveBackward);
            this.direction.x = Number(MiscControls.moveLeft) - Number(MiscControls.moveRight);
            this.direction.normalize();
            if (MiscControls.moveForward || MiscControls.moveBackward)
                this.velocity.z -= this.direction.z * 250.0 * delta * 10;
            if (MiscControls.moveLeft || MiscControls.moveRight)
                this.velocity.x -= this.direction.x * 250.0 * delta * 10;
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
        };
        MiscControls.onDocumentKeyDown = function (evt) {
            var keyCode = evt.keyCode || evt.which;
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
        };
        MiscControls.onDocumentKeyUp = function (evt) {
            var keyCode = evt.keyCode || evt.which;
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
        };
        MiscControls.onDocumentClick = function () {
            controls.lock();
        };
        MiscControls.moveForward = false;
        MiscControls.moveBackward = false;
        MiscControls.moveLeft = false;
        MiscControls.moveRight = false;
        MiscControls.handleJump = false;
        MiscControls.canJump = false;
        return MiscControls;
    }());

    exports.Chunk = Chunk;
    exports.Block = Block;
    exports.Entity = Entity;
    exports.WebGLGame = WebGLGame;
    exports.WebVRGame = WebVRGame;
    exports.World = World;
    exports.MiscControls = MiscControls;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
