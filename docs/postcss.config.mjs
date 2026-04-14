import tailwindPostcss from '@tailwindcss/postcss';
import { postcssIsolateStyles } from 'vitepress';

const VITEPRESS_BASE_STYLES =
  /[\\/]vitepress[\\/]dist[\\/]client[\\/]theme-default[\\/]styles[\\/]base\.css$/;
// Match the resolved CSS file path, not the package import specifier.
const VITEPRESS_OPENAPI_STYLES =
  /[\\/]vitepress-openapi[\\/]dist[\\/]vitepress-openapi\.css$/;

export default {
  plugins: [
    // Add tailwind
    tailwindPostcss(),
    // Make `::: raw` sections be isolated...
    postcssIsolateStyles({
      includeFiles: [
        // Scope the isolation narrowly to VitePress's own base stylesheet.
        // A broad /base.css/ match also catches Tailwind's generated base layer,
        // which turns Tailwind's reset vars into unlayered rules that override
        // utilities like shadow/ring on the page.
        VITEPRESS_BASE_STYLES,
        // ...and the vitepress-openapi plugin styles.
        VITEPRESS_OPENAPI_STYLES,
      ],

      // patch postcssIsolateStyles until vitepress with the https://github.com/vuejs/vitepress/pull/4830 is released
      transform(prefix, _selector) {
        // split selector from its pseudo part if the trailing colon is not escaped
        const [selector, pseudo] = splitSelectorPseudo(_selector);
        return selector + prefix + pseudo;
      },
    }),
  ],
};

// patch postcssIsolateStyles until vitepress with the https://github.com/vuejs/vitepress/pull/4830 is released
export function splitSelectorPseudo(selector) {
  const [base, pseudo = ''] = selector.split(/(?<!\\)(:\S*)$/);
  return [base, pseudo];
}
