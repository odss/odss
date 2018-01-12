let fs = require('fs');
let path = require('path');
var testrunner = require("qunit");
let rollup = require('rollup');
let includePaths = require('rollup-plugin-includepaths');


const ROOT = __dirname;
const TEST_PATH = path.join(ROOT, 'test');
const TEMP_PATH = path.join(ROOT, '.tmp');
const EMPTY_CODE = path.join(TEST_PATH, '_empty.js');

function findFiles(root){
    return new Promise((resolve, reject) => {
        fs.readdir(root, (err, files) => {
            if(err){
                reject(err);
            }else{
                resolve(files.filter(file => file[0] !== '_'));
            }
        });
    });
}

function rollupFile(options){
    return rollup.rollup({
        entry: options.entry,
        plugins: options.plugins || []
    }).then(bundle => {
        return bundle.write({
            format: 'cjs',
            dest: options.dest
        }).then(() => options.dest);
    });
}

function rollupAllFiles(files){
    return Promise.all(files.map(file => {
        return rollupFile({
            entry: path.join(TEST_PATH, file),
            dest: path.join(TEMP_PATH, file),
            plugins: [
                includePaths({
                    include:{'odss-query': 'src/index.js'}
                })
            ]
        });
    }));
}

function runTest(code, tests){
    return new Promise((resolve, reject) => {
        testrunner.run({
            code,
            tests
        }, (err, report) => {
            if(err){
                reject(err);
            }else{
                resolve({
                    file: tests,
                    report
                });
            }
        });
    });
}
testrunner.setup({
    log: {
        globalSummary: true,
        errors: true
    }
});

findFiles(TEST_PATH)
    .then(rollupAllFiles)
    .then(files => {
        return Promise.all(files.map(file =>
            runTest(EMPTY_CODE, file))
        );
    })
    .then(reports => {
        // reports.forEach(report => console.log(report));
    });
