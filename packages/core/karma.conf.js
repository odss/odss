module.exports = function(config) {
    config.set({
        basePath: './',
        frameworks: ['karma-typescript', 'mocha'],
        files: [
            "tests/**/*.ts",
            "src/**/*.ts"
        ],
        preprocessors: {
            "src/**/*.ts": ["karma-typescript"],
            "tests/**/*.ts": ["karma-typescript"],
        },
        karmaTypescriptConfig: {
            "compilerOptions": {
                "target": "ESNext",
                "module": "CommonJS",
            }
        },
        // reporters: ['progress'],
        reporters: ["progress", "karma-typescript"],
        // web server port
        port: 9876,
        // colors: true,

        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,
        autoWatch: false,
        browsers: ['ChromeHeadless'],
    });
};
