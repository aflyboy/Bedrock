(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
    typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
    (factory((global.Bedrock = {}),global.THREE));
}(this, (function (exports,THREE) { 'use strict';

    if (typeof window === "undefined" || window === null) {
        let instance;

        self.addEventListener("message", function (evt) {
            let clazz;

            let data = evt.data;
            if (data.method === "__ctor__") {
                clazz = findClass(data.worker);
                instance = (function (func, args, ctor) {
                    ctor.prototype = func.prototype;

                    let c = new ctor,
                        result = func.apply(c, args);
                    return typeof result === "object" ? result : c;
                })(clazz, data.args, function () {});

                return kickOff();
            } else if (instance) {
                return executeCommand(data.method, data.args);
            }
        });
    }

    function kickOff() {
        setTimeout((function () {
            return instance.run();
        }), 0);

        let results = [];
        for (let i = 0; i < commandQueue.length; i++) {
            let ref = commandQueue[i];

            results.push(instance[ref[0]].apply(instance, ref[1]));
        }

        return results;
    }

    function executeCommand(cmd, args) {
        if (instance) {
            if (instance[cmd] == null)
                console.error("Tried to call unexisting callback name=", cmd);
            return instance[cmd].apply(instance, args);
        } else
            return commandQueue.push([cmd, args]);
    }

    function findClass(name) {
        let rev = self;

        let ref = name.split(/\./);
        for (let i = 0; i < ref.length; i++) {
            let piece = ref[i];
            rev = rev[piece];
        }

        return rev;
    }

    var Block = (function () {
        function Block(id) {
            this.id = id;
        }
        Block.prototype.getId = function () {
            return this.id;
        };
        return Block;
    }());

    var Chunk = (function () {
        function Chunk(x, z) {
            this.sections = [];
            this.x = x;
            this.z = z;
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
        Chunk.prototype.isNearBlock = function (x1, y1, z1, x2, y2, z2) {
            return this.sections[Math.floor(y1 / 256)].hasBlock(x1, y1 % 16, z1) && this.sections[Math.floor(y2 / 256)].hasBlock(x2, y2 % 16, z2);
        };
        return Chunk;
    }());
    var Section = (function () {
        function Section() {
            this.blocks = [];
            for (var i = 0; i < 4096; i++)
                this.blocks[i] = new Block(0);
        }
        Section.prototype.getBlock = function (x, y, z) {
            return this.blocks[(y * 16 + z) * 16 + x];
        };
        Section.prototype.setBlock = function (x, y, z, block) {
            this.blocks[(y * 16 + z) * 16 + x] = block;
        };
        Section.prototype.hasBlock = function (x, y, z) {
            return this.blocks[(y * 16 + z) * 16 + x].getId() != 0;
        };
        return Section;
    }());

    var Entity = (function () {
        function Entity() {
            alert("AAA");
        }
        return Entity;
    }());

    var Constants = (function () {
        function Constants() {
        }
        Constants.BLOCK_SIZE = 50;
        return Constants;
    }());

    var WebGLDirector = (function () {
        function WebGLDirector(scene, camera) {
            this.scene = scene;
            this.camera = camera;
            this.initComponents();
        }
        WebGLDirector.prototype.initComponents = function () {
        };
        WebGLDirector.prototype.renderRegion = function (chunks) {
            var light = new THREE.Color(0xffffff);
            var shadow = new THREE.Color(0x505050);
            var pxGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
            pxGeometry.faces[0].vertexColors = [light, shadow, light];
            pxGeometry.faces[1].vertexColors = [shadow, shadow, light];
            pxGeometry.faceVertexUvs[0][0][0].y = 0.5;
            pxGeometry.faceVertexUvs[0][0][2].y = 0.5;
            pxGeometry.faceVertexUvs[0][1][2].y = 0.5;
            pxGeometry.rotateY(Math.PI / 2);
            pxGeometry.translate(Constants.BLOCK_SIZE / 2, 0, 0);
            var nxGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
            nxGeometry.faces[0].vertexColors = [light, shadow, light];
            nxGeometry.faces[1].vertexColors = [shadow, shadow, light];
            nxGeometry.faceVertexUvs[0][0][0].y = 0.5;
            nxGeometry.faceVertexUvs[0][0][2].y = 0.5;
            nxGeometry.faceVertexUvs[0][1][2].y = 0.5;
            nxGeometry.rotateY(-Math.PI / 2);
            nxGeometry.translate(-Constants.BLOCK_SIZE / 2, 0, 0);
            var pyGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
            pyGeometry.faces[0].vertexColors = [light, light, light];
            pyGeometry.faces[1].vertexColors = [light, light, light];
            pyGeometry.faceVertexUvs[0][0][1].y = 0.5;
            pyGeometry.faceVertexUvs[0][1][0].y = 0.5;
            pyGeometry.faceVertexUvs[0][1][1].y = 0.5;
            pyGeometry.rotateX(-Math.PI / 2);
            pyGeometry.translate(0, Constants.BLOCK_SIZE / 2, 0);
            var nyGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
            nyGeometry.faces[0].vertexColors = [light, light, light];
            nyGeometry.faces[1].vertexColors = [light, light, light];
            nyGeometry.faceVertexUvs[0][0][1].y = 0.5;
            nyGeometry.faceVertexUvs[0][1][0].y = 0.5;
            nyGeometry.faceVertexUvs[0][1][1].y = 0.5;
            nyGeometry.rotateX(-Math.PI / 2);
            nyGeometry.translate(0, -Constants.BLOCK_SIZE / 2, 0);
            var pzGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
            pzGeometry.faces[0].vertexColors = [light, shadow, light];
            pzGeometry.faces[1].vertexColors = [shadow, shadow, light];
            pzGeometry.faceVertexUvs[0][0][0].y = 0.5;
            pzGeometry.faceVertexUvs[0][0][2].y = 0.5;
            pzGeometry.faceVertexUvs[0][1][2].y = 0.5;
            pzGeometry.translate(0, 0, Constants.BLOCK_SIZE / 2);
            var nzGeometry = new THREE.PlaneGeometry(Constants.BLOCK_SIZE, Constants.BLOCK_SIZE);
            nzGeometry.faces[0].vertexColors = [light, shadow, light];
            nzGeometry.faces[1].vertexColors = [shadow, shadow, light];
            nzGeometry.faceVertexUvs[0][0][0].y = 0.5;
            nzGeometry.faceVertexUvs[0][0][2].y = 0.5;
            nzGeometry.faceVertexUvs[0][1][2].y = 0.5;
            nzGeometry.rotateY(Math.PI);
            nzGeometry.translate(0, 0, -Constants.BLOCK_SIZE / 2);
            var texture1 = new THREE.TextureLoader().load("assets/textures/atlas.png");
            var texture2 = new THREE.TextureLoader().load("assets/textures/dirt.png");
            var objects = [];
            for (var i = 0; i < chunks.length; i++) {
                for (var z = 0; z < 16; z++) {
                    for (var x = 0; x < 16; x++) {
                        for (var y = 0; y < 16; y++) {
                            var xx = chunks[i].getX() * 16;
                            var zz = chunks[i].getZ() * 16;
                            var block = chunks[i].getBlock(x, y, z);
                            if (block.getId() == 0)
                                continue;
                            var geometry = new THREE.Geometry();
                            var matrix = new THREE.Matrix4();
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
                            var texture = texture1;
                            if (block.getId() == 12)
                                texture = texture2;
                            texture.magFilter = THREE.NearestFilter;
                            texture.minFilter = THREE.LinearMipMapLinearFilter;
                            var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: texture, vertexColors: THREE.VertexColors, side: THREE.DoubleSide }));
                            this.scene.add(mesh);
                            objects.push(mesh);
                        }
                    }
                }
            }
            var ambientLight = new THREE.AmbientLight(0xaaaaaa);
            this.scene.add(ambientLight);
            var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
            directionalLight.position.set(1, 1, 0.5).normalize();
            this.scene.add(directionalLight);
            return objects;
        };
        WebGLDirector.prototype.setController = function (controls) {
            this.controls = controls;
        };
        return WebGLDirector;
    }());

    var World = (function () {
        function World(seed) {
            this.seed = seed;
        }
        World.prototype.generateChunk = function (x, z) {
            var chunk = new Chunk(x, z);
            var twister = new MT32(this.seed);
            twister.extractNumber();
            for (var x_1 = 0; x_1 < 16; x_1++) {
                for (var z_1 = 0; z_1 < 16; z_1++) {
                    chunk.setBlock(x_1, 0, z_1, new Block(7));
                }
            }
            chunk.setBlock(2, 1, 2, new Block(7));
            chunk.setBlock(3, 1, 2, new Block(7));
            chunk.setBlock(4, 1, 2, new Block(7));
            chunk.setBlock(3, 1, 3, new Block(7));
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
    var intersected;
    var mouse = new THREE.Vector2();
    var raycaster2 = new THREE.Raycaster();
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
            if (!controls.isLocked) {
                MiscControls.moveForward = false;
                MiscControls.moveLeft = false;
                MiscControls.moveBackward = false;
                MiscControls.moveRight = false;
            }
            var directionY = new THREE.Vector3(0, -1, 0);
            this.velocity.y += MiscControls.yIncrement;
            MiscControls.yIncrement = 0;
            MiscControls.canJump = false;
            this.raycaster.ray.origin.copy(controls.getObject().position);
            this.raycaster.ray.origin.y -= 25;
            var intersections1 = this.raycaster.intersectObjects(this.objects);
            var cameraDirection = new THREE.Vector3();
            controls.getObject().getWorldDirection(cameraDirection);
            mouse.x = window.innerWidth / 2;
            mouse.y = window.innerHeight / 2;
            raycaster2.setFromCamera(mouse, this.camera);
            var intersections2 = raycaster2.intersectObjects(this.objects);
            if (intersections2.length > 0) {
                if (intersected != intersections2[0].object) {
                    if (intersected)
                        intersected.material.emissive.setHex(intersected.currentHex);
                    intersected = intersections2[0].object;
                    intersected.currentHex = intersected.material.emissive.getHex();
                    intersected.material.emissive.setHex(0xff0000);
                }
            }
            var time = performance.now();
            var delta = (time - this.prevTime) / 1000;
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= 9.8 * 50.0 * delta;
            this.direction.z = Number(MiscControls.moveForward) - Number(MiscControls.moveBackward);
            this.direction.x = Number(MiscControls.moveLeft) - Number(MiscControls.moveRight);
            this.direction.normalize();
            var moveDirection = new THREE.Vector3();
            if (this.direction.z > 0)
                moveDirection.copy(cameraDirection).negate();
            else if (this.direction.z < 0)
                moveDirection.copy(cameraDirection).negate();
            if (this.direction.x > 0)
                moveDirection.copy(cameraDirection).applyAxisAngle(directionY, 90.0);
            else if (this.direction.x < 0)
                moveDirection.copy(cameraDirection).applyAxisAngle(directionY, -90.0);
            var intersections3 = [];
            if (this.direction.z != 0 || this.direction.x != 0) {
                this.raycaster.ray.direction.copy(moveDirection);
                intersections3 = this.raycaster.intersectObjects(this.objects);
                this.raycaster.ray.direction.copy(directionY);
            }
            if (MiscControls.moveForward || MiscControls.moveBackward)
                this.velocity.z -= this.direction.z * 250.0 * delta * 10;
            if (MiscControls.moveLeft || MiscControls.moveRight)
                this.velocity.x -= this.direction.x * 250.0 * delta * 10;
            if (intersections1.length > 0) {
                this.velocity.y = Math.max(0, this.velocity.y);
                MiscControls.canJump = true;
            }
            if (intersections3.length > 0) {
                if ((this.direction.x != 0))
                    this.velocity.x = 0;
                if ((this.direction.z != 0))
                    this.velocity.z = 0;
            }
            controls.getObject().translateX(this.velocity.x * delta);
            controls.getObject().translateY(this.velocity.y * delta);
            controls.getObject().translateZ(this.velocity.z * delta);
            if (controls.getObject().position.y < 25) {
                this.velocity.y = 0;
                controls.getObject().position.y = 25;
                MiscControls.canJump = true;
            }
            this.prevTime = time;
        };
        MiscControls.onDocumentKeyDown = function (evt) {
            if (!controls.isLocked)
                return;
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
                    if (MiscControls.canJump)
                        MiscControls.yIncrement = 250;
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
            if (!controls.isLocked) {
                controls.lock();
                return;
            }
        };
        MiscControls.prototype.getPlayerX = function () {
            return controls.getObject().position.x;
        };
        MiscControls.prototype.getPlayerY = function () {
            return controls.getObject().position.y;
        };
        MiscControls.prototype.getPlayerZ = function () {
            return controls.getObject().position.z;
        };
        MiscControls.moveForward = false;
        MiscControls.moveBackward = false;
        MiscControls.moveLeft = false;
        MiscControls.moveRight = false;
        MiscControls.canJump = false;
        MiscControls.yIncrement = 0;
        return MiscControls;
    }());

    var ThreadManager = (function () {
        function ThreadManager() {
            this.workers = [];
            for (var i = 0; i < 4; i++)
                this.initWorker();
        }
        ThreadManager.prototype.initWorker = function () {
            return this.workers.push(this.addThread());
        };
        ThreadManager.prototype.addThread = function () {
            var worker = new Worker("libraries/bedrock.js");
            worker.addEventListener("message", function (evt) {
                var data = evt.data;
                console.log("Handle thread message");
                if (data.type == "notify")
                    console.log("Runnable has send notify");
                else if (data.type == "console")
                    console.log("Runnable has send console");
            });
            worker.addEventListener("error", function (evt) {
                console.log("Error in worker " + evt.message);
            });
            worker.postMessage({
                worker: "Bedrock.Test",
                method: "__ctor__",
                args: ["BBB"]
            });
            return new ThreadProxy(worker);
        };
        return ThreadManager;
    }());
    var ThreadProxy = (function () {
        function ThreadProxy(worker) {
        }
        ThreadProxy.i = 0;
        return ThreadProxy;
    }());

    var Test = (function () {
        function Test(args) {
            console.log("Test: Thead initialize: ctor " + args);
        }
        Test.prototype.run = function () {
            console.log("invoke run");
        };
        return Test;
    }());

    exports.Chunk = Chunk;
    exports.Block = Block;
    exports.Entity = Entity;
    exports.WebGLDirector = WebGLDirector;
    exports.World = World;
    exports.MiscControls = MiscControls;
    exports.ThreadManager = ThreadManager;
    exports.Test = Test;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
