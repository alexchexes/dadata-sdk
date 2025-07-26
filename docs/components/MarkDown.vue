<script setup lang="ts">
import markdownit from 'markdown-it';
import { computed } from 'vue';

import { jsDocLinks } from '../utils/jsDocLinks';
import { linkTargetBlank } from '../utils/linkTargetBlank';

const props = defineProps<{
  content?: string | null;
}>();
const md = markdownit({
  breaks: true,
});

md.use(linkTargetBlank);

md.use(jsDocLinks);

const rendered = computed<string | null>(() => {
  return props.content ? md.render(props.content) : null;
});
</script>

<template>
  <div v-if="rendered" v-html="rendered" />
</template>
