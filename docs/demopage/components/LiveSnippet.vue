<script lang="ts" setup>
import type { DadataSuggestion, VueDadataOptions } from '@dadata-sdk/vue';
import vueLang from '@shikijs/langs/vue';
// <-- only Vue grammar
import materialTheme from '@shikijs/themes/material-theme-ocean';
import { watchThrottled } from '@vueuse/core';
// == Temp: use fine-grained bundle technique until release of VitePress with
// == this commit https://github.com/vuejs/vitepress/commit/801648a4c9d91e7f96302932ac9247d5bdd64ef7
// import { codeToHtml } from 'shiki';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import { type PropType, computed, onUnmounted, ref } from 'vue';

// <-- only that theme

let highlighter: Awaited<ReturnType<typeof createHighlighterCore>> | null = null;

const props = defineProps({
  options: {
    type: Object as PropType<VueDadataOptions>,
    required: true,
  },
  nonDefaultOptions: {
    type: Object as PropType<Partial<VueDadataOptions>>,
    required: true,
  },
  showToken: {
    type: Boolean,
    default: false,
  },
  query: {
    type: String,
    default: '',
  },
  suggestion: {
    type: Object as PropType<DadataSuggestion | undefined>,
    default: undefined,
  },
});

const displayedOptions = computed(() =>
  Object.fromEntries(Object.entries(props.nonDefaultOptions).filter(([key]) => key !== 'token')),
);

const sanitize = (str: string) => str.replace(/"/g, `'`);

const code = computed(() => {
  const attrs = ['v-model="query"', 'v-model:suggestion="suggestion"'];

  if (props.showToken) {
    attrs.push(`token="${sanitize(props.options.token)}"`);
  } else {
    attrs.push(':token="token"');
  }

  Object.entries(displayedOptions.value).forEach(([k, val]) => {
    let key = k;
    let value = val;

    if (value === true) {
      attrs.push(key); // we leverage vue boolean props casting
      return;
    } else if (typeof value !== 'string') {
      value = JSON.stringify(value).replace(/'/g, `\\'`);
      key = `:${key}`;
    }

    attrs.push(`${key}="${sanitize(value)}"`);
  });
  const separator = '\n  ';

  const suggestionStr = JSON.stringify(props.suggestion);
  const maxLen = 23;
  const suggestionComment =
    suggestionStr && suggestionStr.length > maxLen
      ? suggestionStr.slice(0, maxLen) + '...'
      : suggestionStr;

  return `<script setup>
// ...
const query = ref(''); ${props.query ? `// ${props.query}` : ''}
const suggestion = ref(undefined); // ${suggestionComment}
<\/script>

<VueDadata${separator}${attrs.join(separator)}\n/>`;
});

const highlighted = ref('');

watchThrottled(
  code,
  () => {
    updateHighlighted();
  },
  { throttle: 30 },
);

const updateHighlighted = async () => {
  if (!highlighter) {
    highlighter = await createHighlighterCore({
      themes: [materialTheme],
      langs: [vueLang],
      engine: createOnigurumaEngine(import('shiki/wasm')),
    });
  }
  const html = highlighter.codeToHtml(code.value, {
    lang: 'vue',
    theme: 'material-theme-ocean',
  });
  highlighted.value = html;
};
updateHighlighted();

onUnmounted(() => {
  highlighter?.dispose();
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <pre
      class="text-[15px] [&>pre]:rounded-xl [&>pre]:p-3 dark:[&>pre]:bg-(--vp-c-bg-alt)! [&>pre>code]:[overflow-wrap:anywhere] [&>pre>code]:whitespace-pre-wrap"
      v-html="highlighted"
    ></pre>
  </div>
</template>
