export class ThreadManager {
    private workers;

    constructor() {
        this.workers = [];

        for (let i = 0; i < 4; i++)
            this.initWorker();
    }

    private initWorker() {
        return this.workers.push(this.addThread());
    }

    private addThread() {
        let worker = new Worker("libraries/bedrock.js");
        worker.addEventListener("message", function (evt) {
            let data = evt.data;
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
    }
}

class ThreadProxy {
    private static i: number = 0;

    constructor(worker) {
    }
}
