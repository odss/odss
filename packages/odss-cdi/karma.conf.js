module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['qunit', 'karma-typescript'],
        files: [
            'src/*.ts',
            'tests/*.ts',
        ],
        preprocessors: {
            '**/*.ts': ['karma-typescript'],
        },
        karmaTypescriptConfig: {
            coverageOptions: {
                instrumentation: false,
            },
            compilerOptions: {
                module: "commonjs",
                target: "esnext",
            },
        },
        reporters: ['progress', "karma-typescript"],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,
        autoWatch: true,
        browsers: ['Chrome', 'Firefox']
    });
};
