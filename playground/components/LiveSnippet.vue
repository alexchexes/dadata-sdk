<script lang="ts" setup>
import { computed, ref, type PropType } from 'vue';
import { codeToHtml } from 'shiki';
import { watchThrottled } from '@vueuse/core';
import type { VueDadataOptions } from '@/types';

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

  return `<VueDadata${separator}${attrs.join(separator)}\n/>`;
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
  const html = await codeToHtml(code.value, {
    lang: 'vue',
    // theme: "material-theme-lighter",
    theme: 'material-theme-ocean',
  });
  highlighted.value = html;
};
updateHighlighted();
</script>

<template>
  <div class="flex flex-col gap-2">
    <pre
      class="text-[15px] [&>pre]:rounded-xl [&>pre]:p-3 [&>pre>code]:[overflow-wrap:anywhere] [&>pre>code]:whitespace-pre-wrap"
      v-html="highlighted"
    ></pre>
  </div>
</template>
