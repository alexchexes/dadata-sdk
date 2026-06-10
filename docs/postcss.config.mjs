import tailwindPostcss from '@tailwindcss/postcss';
import { postcssIsolateStyles } from 'vitepress';

const VITEPRESS_BASE_STYLES =
  /[\\/]vitepress[\\/]dist[\\/]client[\\/]theme-default[\\/]styles[\\/]base\.css$/;
const VITEPRESS_OPENAPI_STYLES =
  /[\\/]vitepress-openapi[\\/]dist[\\/]vitepress-openapi\.css$/;

/** @type {{ plugins: import('postcss').AcceptedPlugin[] }} */
const config = {
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
        // vitepress-openapi ships global Tailwind utilities. Keep them out of
        // `::: raw` demo islands so classes like `grid-cols-1` do not override
        // this site's responsive demo layout utilities.
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

export default config;

// patch postcssIsolateStyles until vitepress with the https://github.com/vuejs/vitepress/pull/4830 is released
/**
 * @param {string} selector
 * @returns {[string, string]}
 */
export function splitSelectorPseudo(selector) {
  const [base, pseudo = ''] = selector.split(/(?<!\\)(:\S*)$/);
  return [base, pseudo];
}
