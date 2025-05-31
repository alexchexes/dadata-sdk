import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfigFactory from './packages/vue-dadata/vite.config';

const vuePkgConfig =
  typeof viteConfigFactory === 'function'
    ? viteConfigFactory({ command: 'serve', mode: 'test' })
    : viteConfigFactory;

export default mergeConfig(
  vuePkgConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
);
