import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.{ts,js}'],
        exclude: ['node_modules', 'dist'],
        environment: 'node',
        setupFiles: [],
        globals: true,
        cover: {
            reporter: ['text', 'json', 'html'],
        },
    },
});
