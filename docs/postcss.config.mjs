import tailwindPostcss from '@tailwindcss/postcss';
import { postcssIsolateStyles } from 'vitepress';

export default {
  plugins: [
    // add tailwind
    tailwindPostcss(),
    // make `::: raw` sections be isolated from the Vitepress styles
    postcssIsolateStyles(),
  ],
};
