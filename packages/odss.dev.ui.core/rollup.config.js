import html from 'rollup-plugin-html';
import sass from 'rollup-plugin-sass';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'esm',
    },
    plugins: [
        html({
            include: '/**/*.html',
        }),
        sass({
            include: '/**/*.scss',
            insert: false,
        }),
    ],
};