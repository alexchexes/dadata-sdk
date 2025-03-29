<script lang="ts" setup>
import type { VueDadataProps } from '@/VueDadata.vue';
import { computed, ref, type PropType } from 'vue';
import { codeToHtml } from 'shiki';
import { watchThrottled } from '@vueuse/core';

const props = defineProps({
  options: {
    type: Object as PropType<VueDadataProps>,
    required: true,
  },
  defaultOptions: {
    type: Object as PropType<Partial<VueDadataProps>>,
    required: true,
  },
  showToken: {
    type: Boolean,
    default: false,
  },
});

const nonDefaultOptions = computed(() =>
  Object.fromEntries(
    Object.entries(props.options).filter(([key, val]) => {
      const def = props.defaultOptions[key as keyof VueDadataProps];
      if (val === def) {
        return false;
      }
      if (typeof def === 'undefined' && typeof val === 'string' && !val) {
        return false;
      }
      return true;
    }),
  ),
);

const displayedOptions = computed(() =>
  Object.fromEntries(Object.entries(nonDefaultOptions.value).filter(([key]) => key !== 'token')),
);

const code = computed(() => {
  const attrs = ['v-model="query"', 'v-model:suggestion="suggestion"'];

  if (props.showToken) {
    attrs.push(`token="${props.options.token.replace(/"/g, `'`)}"`);
  } else {
    attrs.push(':token="token"');
  }

  Object.entries(displayedOptions.value).forEach(([k, val]) => {
    let key = k;
    let value = val;

    if (value === true) {
      attrs.push(key); // vue boolean props casting
      return;
    } else if (typeof value !== 'string') {
      value = JSON.stringify(value);
      key = `:${key}`;
    }

    attrs.push(`${key}="${value.replace(/"/g, `'`)}"`);
  });
  const indent = '\n  ';

  return `<VueDadata${indent}${attrs.join(indent)}\n/>`;
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
