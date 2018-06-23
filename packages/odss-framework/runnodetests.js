require("babel-register")({
    only: [/tests/, /src/, /odss-common/, /sjs-query/]
});
const run = require('qunit/bin/run');
const reporter = require('qunit/bin/find-reporter');

run(['tests/**/*.js'], {
     filter:null,
     requires: [],
     reporter: reporter.findReporter()
});
