module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['karma-typescript', 'mocha'],
        files: [
            "tests/**/*.ts",
            "src/**/*.ts"
        ],
        preprocessors: {
            "**/*.ts": ["karma-typescript"]
        },
        karmaTypescriptConfig: {
            coverageOptions: {
                instrumentation: false,
            },
            compilerOptions: {
                target: "ESNext",
                module: "commonjs",
            },
        },
        // reporters: ['progress'],
        reporters: ["progress", "karma-typescript"],
        // web server port
        port: 9876,
        // colors: true,

        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,
        autoWatch: true,
        browsers: ['Chrome', 'Firefox']
    });
};
