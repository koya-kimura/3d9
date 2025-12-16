import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
    plugins: [
        glsl({
            include: ['**/*.glsl', '**/*.vert', '**/*.frag'],
            defaultExtension: 'glsl',
            warnDuplicatedImports: true,
        }),
    ],
    server: {
        port: 5173,
        strictPort: false,
    },
});
