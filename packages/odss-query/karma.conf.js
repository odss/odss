// Karma configuration
// Generated on Tue May 31 2016 12:46:15 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    basePath: './',

    frameworks: ['systemjs', 'qunit'],

    files: [
       "test/index.js"
    ],
    systemjs: {
        config: {
            defaultJSExtensions: true,
            transpiler: 'plugin-babel',
            paths: {
                'plugin-babel': 'node_modules/systemjs-plugin-babel/plugin-babel.js',
                'systemjs-babel-build': 'node_modules/systemjs-plugin-babel/systemjs-babel-browser.js',
                'systemjs': 'node_modules/systemjs/dist/system.js',

                'odss-query': 'src/index.js'
            }
        },
        serveFiles: [
            'src/**/*.*',
            'test/**/*.*',
            'node_modules/**/*.js'
        ]
    },
    preprocessors: {
      "src/**/*.js": ["babel"],
      "test/**/*.js": ["babel"]
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    autoWatch: true,

    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  });
};
