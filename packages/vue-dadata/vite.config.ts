import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'; // 'serve' for dev, undefined for Vitest
  return {
    plugins: [
      vue(),
      vueDevTools(),
      isBuild &&
        dts({
          outDir: 'dist/types',
          insertTypesEntry: true,
          tsconfigPath: resolve(__dirname, 'tsconfig.json'),
          aliasesExclude: ['@dadata-sdk/api-types'],
        }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@dadata-sdk/api-types': isBuild
          ? resolve(__dirname, '../api-types/dist/esm/index.js')
          : resolve(__dirname, '../api-types/src/index.ts'),
      },
    },

    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'VueDadata',
        formats: ['es', 'umd', 'cjs'],
        fileName: 'vue-dadata',
      },
      rollupOptions: {
        // externalize deps that shouldn't be bundled into the library
        external: ['vue', '@dadata-sdk/api-types'],
        output: {
          globals: {
            vue: 'Vue',
            '@dadata-sdk/api-types': 'DaDataTypes',
          },
        },
      },
    },
  };
});
