import typescript from "rollup-plugin-typescript";

export default {
    input: "src/Bedrock.ts",
    output: [
        {
            file: "dist/libraries/bedrock.js",
            format: "umd",
            name: "Bedrock",
            globals: {
                three: "THREE"
            }
        }
    ],
    plugins: [
        typescript()
    ],
    external: [
        "three"
    ]
};
