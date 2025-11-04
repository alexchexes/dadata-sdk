import tailwindPostcss from '@tailwindcss/postcss';
import { postcssIsolateStyles } from 'vitepress';

export default {
  plugins: [
    // Add tailwind
    tailwindPostcss(),
    // Make `::: raw` sections be isolated...
    postcssIsolateStyles({
      includeFiles: [
        // ...from the Vitepress styles...
        /base\.css/,
        // ...and from vitepress-openapi plugin styles
        /vitepress-openapi\.css/,
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
