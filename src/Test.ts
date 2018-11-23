export class Test implements Runnable{
    constructor(name, args) {
        console.log("Test: Thead initialize: ctor " + args);
    }

    run() {
        postMessage({type: "callback", value: 0, done: this}, null, []);
    }

    add() {
        console.log("Add called.");
    }
}
