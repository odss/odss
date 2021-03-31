const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript');

module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['qunit'],
        files: [
            "tests/*.ts",
        ],
        preprocessors: {
            'tests/*.ts': ['rollup'],
            'src/*.ts': ['rollup']
        },
        rollupPreprocessor: {
            plugins: [
                resolve(),
                typescript()
            ],
            output: {
                format: 'iife',
                name: 'frame',
                // sourcemap: 'inline'
            }
        },
        reporters: ['progress'],
        // web server port
        port: 9876,
        colors: true,

        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,
        autoWatch: true,
        browsers: ['Chrome', 'Firefox']
    });
};
