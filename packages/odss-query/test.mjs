import microbundle from 'microbundle';

microbundle({
    cwd: '.',
    sourcemap: false,
    compress: false,
    format: "es",
    target: "node"
})