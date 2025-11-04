<script lang="ts" setup>
import { computed } from 'vue';

import IconHelp from './IconHelp.vue';

const props = defineProps<{
  helpLink: string;
}>();

const isExternal = computed(() => /^https?:\/\//.test(props.helpLink));
</script>

<template>
  <a
    class="size-5 -translate-y-[1px] text-(--vp-c-text-3) opacity-65 hover:text-(--vp-c-brand-1) hover:opacity-100"
    :href="helpLink"
    :rel="isExternal ? 'noopener' : undefined"
    :target="isExternal ? '_blank' : undefined"
  >
    <IconHelp class="inline-block size-[inherit] translate-y-[inherit]" />
  </a>
</template>
