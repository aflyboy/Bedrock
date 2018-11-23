import {findClass} from "../Process";

export class ThreadManager {
    private workers: ThreadProxy[];
    private load: object;

    constructor(options) {
        let scope = this;

        this.workers = [];
        this.load = {};

        for (let i = 0; i < 4; i++) {
            this.load[i] = 0;

            this.workers.push(this.invokeWorker({
                process: options.process,
                args: options.args,
                onBeforeCall: function (name, args) {
                    return scope.load[i] += 1;
                },
                onAfterCall: function (data) {
                    scope.load[i] -= 1;
                }
            }));
        }
    }

    public getWorker(): ThreadProxy {
        let scope = this;

        let worker = (function () {
            let ref = scope.load,
                results = [];

            for (let key in ref)
                results.push([ref[key], key]);

            return results;
        }).call(this);
        worker.sort(function (a, b) {
            return a[0] - b[0];
        });

        return this.workers[worker[0][1]];
    }

    private invokeWorker(options): ThreadProxy {
        let worker = new Worker("libraries/bedrock.js");
        worker.addEventListener("message", function (evt) {
            let data = evt.data;

            let callback = options.onAfterCall;
            if (data.type == "callback")
                if (callback != null)
                    return callback(data.value);
        });
        worker.addEventListener("error", function (evt) {
            console.error(evt.message);
        });
        worker.postMessage({
            process: options.process,
            method: "__ctor__",
            args: options.args != null ? options.args : []
        });

        return new ThreadProxy(worker, options.process, options.onBeforeCall);
    }
}

class ThreadProxy {
    private worker: Worker;

    constructor(worker, process, onBeforeCall) {
        let scope = this;

        this.worker = worker;
        // @ts-ignore
        let ref = findClass(process).prototype;

        let instance = function (key) {
            return scope[key] = function () {
                let args = 1 <= arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
                if (typeof onBeforeCall === "function")
                    onBeforeCall(key, args);
                scope.worker.postMessage({method: key, args: args});
            }
        };
        for (let key in ref) {
            if (key === "constructor" || key === "run")
                continue;

            instance(key);
        }
    }
}
