const gulp = require("gulp");
const rollup = require("rollup");
const rollupTypeScript = require("rollup-plugin-typescript");

gulp.task("watch", function () {
    const watcher = gulp.watch("./src/**/*.ts", ['build']);

    watcher.on("change", function (evt) {
        console.log("File " + evt.path + " was " + evt.type + ", running tasks...")
    })
});

gulp.task("build", async function () {
    const bundle = await rollup.rollup({
        input: "./src/Bedrock.ts",
        plugins: [
            rollupTypeScript()
        ],
        external: [
            "three"
        ]
    });

    await bundle.write({
        file: "./dist/libraries/bedrock.js",
        format: "umd",
        name: "Bedrock",
        globals: {
            three: "THREE"
        }
    });
});
