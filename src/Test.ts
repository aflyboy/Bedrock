export class Test implements Runnable{
    constructor(args) {
        console.log("Test: Thead initialize: ctor " + args);
    }

    run() {
        console.log("invoke run");
    }
}
