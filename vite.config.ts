import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => ({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/lib.ts'),
            name: 'QuenchStore',
            fileName: 'quench-store',
            formats: ['cjs', 'iife', 'es', 'umd']
        },
        outDir: 'build'
    },
    esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    plugins: [dts()],
}))
