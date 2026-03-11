import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [vue()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'FasterCrudVue',
          fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
          formats: ['es', 'cjs'],
        },
        rollupOptions: {
          external: ['vue', 'naive-ui', '@faster-crud/core'],
          output: {
            globals: {
              vue: 'Vue',
              'naive-ui': 'NaiveUi',
              '@faster-crud/core': 'FasterCrudCore',
            },
          },
        },
        outDir: 'dist',
      },
    }
  }
  return { plugins: [vue()] }
})
