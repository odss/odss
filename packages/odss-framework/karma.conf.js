const resolve = require('rollup-plugin-node-resolve');


module.exports = function(config) {
  config.set({

    basePath: './',
    frameworks: ['qunit', 'sinon'],
    files: ['src/*.js', 'test/*.js'],
    preprocessors: {
        "src/*.js": ["rollup"],
        "test/*.js": ["rollup"]
    },
    rollupPreprocessor: {
		  plugins: [
        resolve()
      ],
      output:{
        format: 'iife',
        name: 'odss',
      }
		  // sourcemap: 'inline'
	  },
    reporters: ['progress'],
    port: 9876,
    colors: true,

    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    autoWatch: true,

    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome','Firefox'],
    singleRun: false,
    concurrency: Infinity
  });
};