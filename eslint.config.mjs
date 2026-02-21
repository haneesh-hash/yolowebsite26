import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        files: ["script.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                gsap: "readonly",
                ScrollTrigger: "readonly",
                IntersectionObserver: "readonly",
                requestAnimationFrame: "readonly"
            }
        }
    },
    {
        files: ["server.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                require: "readonly",
                module: "readonly",
                __dirname: "readonly",
                process: "readonly",
                console: "readonly"
            }
        }
    },
    {
        ignores: ["dist/", "node_modules/"]
    }
];
