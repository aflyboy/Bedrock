if (typeof window === "undefined" || window === null) {
    let instance;
    let commandQueue = [];

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
